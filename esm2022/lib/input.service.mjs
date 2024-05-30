import { InputManager } from './input.manager';
import { NgxCurrencyInputMode } from './ngx-currency.config';
export class InputService {
    constructor(htmlInputElement, _options) {
        this._options = _options;
        this._singleDigitRegex = new RegExp(/^[0-9\u0660-\u0669\u06F0-\u06F9]$/);
        this._onlyNumbersRegex = new RegExp(/[^0-9\u0660-\u0669\u06F0-\u06F9]/g);
        this._perArNumber = new Map([
            ['\u06F0', '0'],
            ['\u06F1', '1'],
            ['\u06F2', '2'],
            ['\u06F3', '3'],
            ['\u06F4', '4'],
            ['\u06F5', '5'],
            ['\u06F6', '6'],
            ['\u06F7', '7'],
            ['\u06F8', '8'],
            ['\u06F9', '9'],
            ['\u0660', '0'],
            ['\u0661', '1'],
            ['\u0662', '2'],
            ['\u0663', '3'],
            ['\u0664', '4'],
            ['\u0665', '5'],
            ['\u0666', '6'],
            ['\u0667', '7'],
            ['\u0668', '8'],
            ['\u0669', '9'],
        ]);
        this.inputManager = new InputManager(htmlInputElement);
    }
    addNumber(keyCode) {
        const { decimal, precision, inputMode } = this._options;
        const keyChar = String.fromCharCode(keyCode);
        const isDecimalChar = keyChar === this._options.decimal;
        if (!this.rawValue) {
            this.rawValue = this.applyMask(false, keyChar);
            let selectionStart = undefined;
            if (inputMode === NgxCurrencyInputMode.Natural && precision > 0) {
                selectionStart = this.rawValue.indexOf(decimal);
                if (isDecimalChar) {
                    selectionStart++;
                }
            }
            this.updateFieldValue(selectionStart);
        }
        else {
            const selectionStart = this.inputSelection.selectionStart;
            const selectionEnd = this.inputSelection.selectionEnd;
            const rawValueStart = this.rawValue.substring(0, selectionStart);
            let rawValueEnd = this.rawValue.substring(selectionEnd, this.rawValue.length);
            // In natural mode, replace decimals instead of shifting them.
            const inDecimalPortion = rawValueStart.indexOf(decimal) !== -1;
            if (inputMode === NgxCurrencyInputMode.Natural &&
                inDecimalPortion &&
                selectionStart === selectionEnd) {
                rawValueEnd = rawValueEnd.substring(1);
            }
            const newValue = rawValueStart + keyChar + rawValueEnd;
            let nextSelectionStart = selectionStart + 1;
            const isDecimalOrThousands = isDecimalChar || keyChar === this._options.thousands;
            if (isDecimalOrThousands && keyChar === rawValueEnd[0]) {
                // If the cursor is just before the decimal or thousands separator and the user types the
                // decimal or thousands separator, move the cursor past it.
                nextSelectionStart++;
            }
            else if (!this._singleDigitRegex.test(keyChar)) {
                // Ignore other non-numbers.
                return;
            }
            this.rawValue = newValue;
            this.updateFieldValue(nextSelectionStart);
        }
    }
    applyMask(isNumber, rawValue, disablePadAndTrim = false) {
        const { allowNegative, decimal, precision, prefix, suffix, thousands, min, inputMode, } = this._options;
        let { max } = this._options;
        rawValue = isNumber ? new Number(rawValue).toFixed(precision) : rawValue;
        let onlyNumbers = rawValue.replace(this._onlyNumbersRegex, '');
        if (!onlyNumbers && rawValue !== decimal) {
            return '';
        }
        if (inputMode === NgxCurrencyInputMode.Natural &&
            !isNumber &&
            !disablePadAndTrim) {
            rawValue = this.padOrTrimPrecision(rawValue);
            onlyNumbers = rawValue.replace(this._onlyNumbersRegex, '');
        }
        let integerPart = onlyNumbers
            .slice(0, onlyNumbers.length - precision)
            .replace(/^\u0660*/g, '')
            .replace(/^\u06F0*/g, '')
            .replace(/^0*/g, '');
        if (integerPart == '') {
            integerPart = '0';
        }
        const integerValue = parseInt(integerPart);
        integerPart = integerPart.replace(/\B(?=([0-9\u0660-\u0669\u06F0-\u06F9]{3})+(?![0-9\u0660-\u0669\u06F0-\u06F9]))/g, thousands);
        if (thousands && integerPart.startsWith(thousands)) {
            integerPart = integerPart.substring(1);
        }
        let newRawValue = integerPart;
        const decimalPart = onlyNumbers.slice(onlyNumbers.length - precision);
        const decimalValue = parseInt(decimalPart) || 0;
        const isNegative = rawValue.indexOf('-') > -1;
        // Ensure max is at least as large as min.
        max =
            max === null || max === undefined || min === null || min === undefined
                ? max
                : Math.max(max, min);
        // Ensure precision number works well with more than 2 digits
        // 23 / 100... 233 / 1000 and so on
        const divideBy = Number('1'.padEnd(precision + 1, '0'));
        // Restrict to the min and max values.
        let newValue = integerValue + decimalValue / divideBy;
        newValue = isNegative ? -newValue : newValue;
        if (max !== null && max !== undefined && newValue > max) {
            return this.applyMask(true, max + '');
        }
        else if (min !== null && min !== undefined && newValue < min) {
            return this.applyMask(true, min + '');
        }
        if (precision > 0) {
            if (newRawValue == '0' && decimalPart.length < precision) {
                newRawValue += decimal + '0'.repeat(precision - 1) + decimalPart;
            }
            else {
                newRawValue += decimal + decimalPart;
            }
        }
        // let isZero = newValue == 0;
        const operator = isNegative && allowNegative /*&& !isZero */ ? '-' : '';
        return operator + prefix + newRawValue + suffix;
    }
    padOrTrimPrecision(rawValue) {
        const { decimal, precision } = this._options;
        let decimalIndex = rawValue.lastIndexOf(decimal);
        if (decimalIndex === -1) {
            decimalIndex = rawValue.length;
            rawValue += decimal;
        }
        let decimalPortion = rawValue
            .substring(decimalIndex)
            .replace(this._onlyNumbersRegex, '');
        const actualPrecision = decimalPortion.length;
        if (actualPrecision < precision) {
            for (let i = actualPrecision; i < precision; i++) {
                decimalPortion += '0';
            }
        }
        else if (actualPrecision > precision) {
            decimalPortion = decimalPortion.substring(0, decimalPortion.length + precision - actualPrecision);
        }
        return rawValue.substring(0, decimalIndex) + decimal + decimalPortion;
    }
    clearMask(rawValue) {
        if (this.isNullable() && rawValue === '')
            return null;
        let value = (rawValue || '0')
            .replace(this._options.prefix, '')
            .replace(this._options.suffix, '');
        if (this._options.thousands) {
            value = value.replace(new RegExp('\\' + this._options.thousands, 'g'), '');
        }
        if (this._options.decimal) {
            value = value.replace(this._options.decimal, '.');
        }
        this._perArNumber.forEach((val, key) => {
            const re = new RegExp(key, 'g');
            value = value.replace(re, val);
        });
        return parseFloat(value);
    }
    changeToNegative() {
        if (this._options.allowNegative /*&& this.rawValue != ""*/ &&
            this.rawValue?.charAt(0) != '-' /*&& this.value != 0*/) {
            // Apply the mask to ensure the min and max values are enforced.
            this.rawValue = this.applyMask(false, '-' + (this.rawValue ? this.rawValue : '0'));
        }
    }
    changeToPositive() {
        // Apply the mask to ensure the min and max values are enforced.
        this.rawValue = this.applyMask(false, this.rawValue?.replace('-', '') ?? '');
    }
    removeNumber(keyCode) {
        const { decimal, thousands, prefix, suffix, inputMode } = this._options;
        if (this.isNullable() && this.value == 0) {
            this.rawValue = null;
            return;
        }
        let selectionEnd = this.inputSelection.selectionEnd;
        let selectionStart = this.inputSelection.selectionStart;
        const suffixStart = (this.rawValue?.length ?? 0) - suffix.length;
        selectionEnd = Math.min(suffixStart, Math.max(selectionEnd, prefix.length));
        selectionStart = Math.min(suffixStart, Math.max(selectionStart, prefix.length));
        // Check if selection was entirely in the prefix or suffix.
        if (selectionStart === selectionEnd &&
            this.inputSelection.selectionStart !== this.inputSelection.selectionEnd) {
            this.updateFieldValue(selectionStart);
            return;
        }
        let decimalIndex = this.rawValue?.indexOf(decimal) ?? -1;
        if (decimalIndex === -1) {
            decimalIndex = this.rawValue?.length ?? 0;
        }
        let shiftSelection = 0;
        let insertChars = '';
        const isCursorInDecimals = decimalIndex < selectionEnd;
        const isCursorImmediatelyAfterDecimalPoint = decimalIndex + 1 === selectionEnd;
        if (selectionEnd === selectionStart) {
            if (keyCode == 8) {
                if (selectionStart <= prefix.length) {
                    return;
                }
                selectionStart--;
                // If previous char isn't a number, go back one more.
                if (!this.rawValue
                    ?.substring(selectionStart, selectionStart + 1)
                    .match(/\d/)) {
                    selectionStart--;
                }
                // In natural mode, jump backwards when in decimal portion of number.
                if (inputMode === NgxCurrencyInputMode.Natural && isCursorInDecimals) {
                    shiftSelection = -1;
                    // when removing a single whole number, replace it with 0
                    if (isCursorImmediatelyAfterDecimalPoint &&
                        (this.value ?? 0) < 10 &&
                        (this.value ?? 0) > -10) {
                        insertChars += '0';
                    }
                }
            }
            else if (keyCode == 46 || keyCode == 63272) {
                if (selectionStart === suffixStart) {
                    return;
                }
                selectionEnd++;
                // If next char isn't a number, go one more.
                if (!this.rawValue
                    ?.substring(selectionStart, selectionStart + 1)
                    .match(/\d/)) {
                    selectionStart++;
                    selectionEnd++;
                }
            }
        }
        // In natural mode, replace decimals with 0s.
        if (inputMode === NgxCurrencyInputMode.Natural &&
            selectionStart > decimalIndex) {
            const replacedDecimalCount = selectionEnd - selectionStart;
            for (let i = 0; i < replacedDecimalCount; i++) {
                insertChars += '0';
            }
        }
        let selectionFromEnd = (this.rawValue?.length ?? 0) - selectionEnd;
        this.rawValue =
            this.rawValue?.substring(0, selectionStart) +
                insertChars +
                this.rawValue?.substring(selectionEnd);
        // Remove leading thousand separator from raw value.
        const startChar = this.rawValue.substring(prefix.length, prefix.length + 1);
        if (startChar === thousands) {
            this.rawValue =
                this.rawValue.substring(0, prefix.length) +
                    this.rawValue.substring(prefix.length + 1);
            selectionFromEnd = Math.min(selectionFromEnd, this.rawValue.length - prefix.length);
        }
        this.updateFieldValue(this.rawValue.length - selectionFromEnd + shiftSelection, true);
    }
    updateFieldValue(selectionStart, disablePadAndTrim = false) {
        const newRawValue = this.applyMask(false, this.rawValue ?? '', disablePadAndTrim);
        selectionStart ??= this.rawValue?.length ?? 0;
        selectionStart = Math.max(this._options.prefix.length, Math.min(selectionStart, (this.rawValue?.length ?? 0) - this._options.suffix.length));
        this.inputManager.updateValueAndCursor(newRawValue, this.rawValue?.length ?? 0, selectionStart);
    }
    updateOptions(options) {
        const value = this.value;
        this._options = options;
        this.value = value;
    }
    prefixLength() {
        return this._options.prefix.length;
    }
    suffixLength() {
        return this._options.suffix.length;
    }
    isNullable() {
        return this._options.nullable;
    }
    get canInputMoreNumbers() {
        return this.inputManager.canInputMoreNumbers;
    }
    get inputSelection() {
        return this.inputManager.inputSelection;
    }
    get rawValue() {
        return this.inputManager.rawValue;
    }
    set rawValue(value) {
        this.inputManager.rawValue = value;
    }
    get storedRawValue() {
        return this.inputManager.storedRawValue;
    }
    get value() {
        return this.clearMask(this.rawValue);
    }
    set value(value) {
        this.rawValue = this.applyMask(true, '' + value);
    }
    _isNullOrUndefined(value) {
        return value === null || value === undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jdXJyZW5jeS9zcmMvbGliL2lucHV0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBcUIsb0JBQW9CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVoRixNQUFNLE9BQU8sWUFBWTtJQWtDdkIsWUFDRSxnQkFBa0MsRUFDMUIsUUFBMkI7UUFBM0IsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7UUFuQ3BCLHNCQUFpQixHQUFHLElBQUksTUFBTSxDQUM3QyxtQ0FBbUMsQ0FDcEMsQ0FBQztRQUNlLHNCQUFpQixHQUFHLElBQUksTUFBTSxDQUM3QyxtQ0FBbUMsQ0FDcEMsQ0FBQztRQUVlLGlCQUFZLEdBQUcsSUFBSSxHQUFHLENBQWlCO1lBQ3RELENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUVmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcs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QUM7SUFDcEMsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLEtBQW9CO1FBQy9CLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUNyQyxDQUFDO0lBRUQsSUFBSSxjQUFjO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUM7SUFDMUMsQ0FBQztJQUVELElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLEtBQW9CO1FBQzVCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxLQUFnQztRQUN6RCxPQUFPLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsQ0FBQztJQUMvQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbnB1dE1hbmFnZXIgfSBmcm9tICcuL2lucHV0Lm1hbmFnZXInO1xuaW1wb3J0IHsgTmd4Q3VycmVuY3lDb25maWcsIE5neEN1cnJlbmN5SW5wdXRNb2RlIH0gZnJvbSAnLi9uZ3gtY3VycmVuY3kuY29uZmlnJztcblxuZXhwb3J0IGNsYXNzIElucHV0U2VydmljZSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3NpbmdsZURpZ2l0UmVnZXggPSBuZXcgUmVnRXhwKFxuICAgIC9eWzAtOVxcdTA2NjAtXFx1MDY2OVxcdTA2RjAtXFx1MDZGOV0kLyxcbiAgKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfb25seU51bWJlcnNSZWdleCA9IG5ldyBSZWdFeHAoXG4gICAgL1teMC05XFx1MDY2MC1cXHUwNjY5XFx1MDZGMC1cXHUwNkY5XS9nLFxuICApO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX3BlckFyTnVtYmVyID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oW1xuICAgIFsnXFx1MDZGMCcsICcwJ10sXG4gICAgWydcXHUwNkYxJywgJzEnXSxcbiAgICBbJ1xcdTA2RjInLCAnMiddLFxuICAgIFsnXFx1MDZGMycsICczJ10sXG4gICAgWydcXHUwNkY0JywgJzQnXSxcbiAgICBbJ1xcdTA2RjUnLCAnNSddLFxuICAgIFsnXFx1MDZGNicsICc2J10sXG4gICAgWydcXHUwNkY3JywgJzcnXSxcbiAgICBbJ1xcdTA2RjgnLCAnOCddLFxuICAgIFsnXFx1MDZGOScsICc5J10sXG5cbiAgICBbJ1xcdTA2NjAnLCAnMCddLFxuICAgIFsnXFx1MDY2MScsICcxJ10sXG4gICAgWydcXHUwNjYyJywgJzInXSxcbiAgICBbJ1xcdTA2NjMnLCAnMyddLFxuICAgIFsnXFx1MDY2NCcsICc0J10sXG4gICAgWydcXHUwNjY1JywgJzUnXSxcbiAgICBbJ1xcdTA2NjYnLCAnNiddLFxuICAgIFsnXFx1MDY2NycsICc3J10sXG4gICAgWydcXHUwNjY4JywgJzgnXSxcbiAgICBbJ1xcdTA2NjknLCAnOSddLFxuICBdKTtcblxuICBpbnB1dE1hbmFnZXI6IElucHV0TWFuYWdlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBodG1sSW5wdXRFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50LFxuICAgIHByaXZhdGUgX29wdGlvbnM6IE5neEN1cnJlbmN5Q29uZmlnLFxuICApIHtcbiAgICB0aGlzLmlucHV0TWFuYWdlciA9IG5ldyBJbnB1dE1hbmFnZXIoaHRtbElucHV0RWxlbWVudCk7XG4gIH1cblxuICBhZGROdW1iZXIoa2V5Q29kZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgeyBkZWNpbWFsLCBwcmVjaXNpb24sIGlucHV0TW9kZSB9ID0gdGhpcy5fb3B0aW9ucztcbiAgICBjb25zdCBrZXlDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlKTtcbiAgICBjb25zdCBpc0RlY2ltYWxDaGFyID0ga2V5Q2hhciA9PT0gdGhpcy5fb3B0aW9ucy5kZWNpbWFsO1xuXG4gICAgaWYgKCF0aGlzLnJhd1ZhbHVlKSB7XG4gICAgICB0aGlzLnJhd1ZhbHVlID0gdGhpcy5hcHBseU1hc2soZmFsc2UsIGtleUNoYXIpO1xuICAgICAgbGV0IHNlbGVjdGlvblN0YXJ0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAoaW5wdXRNb2RlID09PSBOZ3hDdXJyZW5jeUlucHV0TW9kZS5OYXR1cmFsICYmIHByZWNpc2lvbiA+IDApIHtcbiAgICAgICAgc2VsZWN0aW9uU3RhcnQgPSB0aGlzLnJhd1ZhbHVlLmluZGV4T2YoZGVjaW1hbCk7XG4gICAgICAgIGlmIChpc0RlY2ltYWxDaGFyKSB7XG4gICAgICAgICAgc2VsZWN0aW9uU3RhcnQrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy51cGRhdGVGaWVsZFZhbHVlKHNlbGVjdGlvblN0YXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2VsZWN0aW9uU3RhcnQgPSB0aGlzLmlucHV0U2VsZWN0aW9uLnNlbGVjdGlvblN0YXJ0O1xuICAgICAgY29uc3Qgc2VsZWN0aW9uRW5kID0gdGhpcy5pbnB1dFNlbGVjdGlvbi5zZWxlY3Rpb25FbmQ7XG4gICAgICBjb25zdCByYXdWYWx1ZVN0YXJ0ID0gdGhpcy5yYXdWYWx1ZS5zdWJzdHJpbmcoMCwgc2VsZWN0aW9uU3RhcnQpO1xuICAgICAgbGV0IHJhd1ZhbHVlRW5kID0gdGhpcy5yYXdWYWx1ZS5zdWJzdHJpbmcoXG4gICAgICAgIHNlbGVjdGlvbkVuZCxcbiAgICAgICAgdGhpcy5yYXdWYWx1ZS5sZW5ndGgsXG4gICAgICApO1xuXG4gICAgICAvLyBJbiBuYXR1cmFsIG1vZGUsIHJlcGxhY2UgZGVjaW1hbHMgaW5zdGVhZCBvZiBzaGlmdGluZyB0aGVtLlxuICAgICAgY29uc3QgaW5EZWNpbWFsUG9ydGlvbiA9IHJhd1ZhbHVlU3RhcnQuaW5kZXhPZihkZWNpbWFsKSAhPT0gLTE7XG4gICAgICBpZiAoXG4gICAgICAgIGlucHV0TW9kZSA9PT0gTmd4Q3VycmVuY3lJbnB1dE1vZGUuTmF0dXJhbCAmJlxuICAgICAgICBpbkRlY2ltYWxQb3J0aW9uICYmXG4gICAgICAgIHNlbGVjdGlvblN0YXJ0ID09PSBzZWxlY3Rpb25FbmRcbiAgICAgICkge1xuICAgICAgICByYXdWYWx1ZUVuZCA9IHJhd1ZhbHVlRW5kLnN1YnN0cmluZygxKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV3VmFsdWUgPSByYXdWYWx1ZVN0YXJ0ICsga2V5Q2hhciArIHJhd1ZhbHVlRW5kO1xuICAgICAgbGV0IG5leHRTZWxlY3Rpb25TdGFydCA9IHNlbGVjdGlvblN0YXJ0ICsgMTtcbiAgICAgIGNvbnN0IGlzRGVjaW1hbE9yVGhvdXNhbmRzID1cbiAgICAgICAgaXNEZWNpbWFsQ2hhciB8fCBrZXlDaGFyID09PSB0aGlzLl9vcHRpb25zLnRob3VzYW5kcztcbiAgICAgIGlmIChpc0RlY2ltYWxPclRob3VzYW5kcyAmJiBrZXlDaGFyID09PSByYXdWYWx1ZUVuZFswXSkge1xuICAgICAgICAvLyBJZiB0aGUgY3Vyc29yIGlzIGp1c3QgYmVmb3JlIHRoZSBkZWNpbWFsIG9yIHRob3VzYW5kcyBzZXBhcmF0b3IgYW5kIHRoZSB1c2VyIHR5cGVzIHRoZVxuICAgICAgICAvLyBkZWNpbWFsIG9yIHRob3VzYW5kcyBzZXBhcmF0b3IsIG1vdmUgdGhlIGN1cnNvciBwYXN0IGl0LlxuICAgICAgICBuZXh0U2VsZWN0aW9uU3RhcnQrKztcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX3NpbmdsZURpZ2l0UmVnZXgudGVzdChrZXlDaGFyKSkge1xuICAgICAgICAvLyBJZ25vcmUgb3RoZXIgbm9uLW51bWJlcnMuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yYXdWYWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy51cGRhdGVGaWVsZFZhbHVlKG5leHRTZWxlY3Rpb25TdGFydCk7XG4gICAgfVxuICB9XG5cbiAgYXBwbHlNYXNrKFxuICAgIGlzTnVtYmVyOiBib29sZWFuLFxuICAgIHJhd1ZhbHVlOiBzdHJpbmcsXG4gICAgZGlzYWJsZVBhZEFuZFRyaW0gPSBmYWxzZSxcbiAgKTogc3RyaW5nIHtcbiAgICBjb25zdCB7XG4gICAgICBhbGxvd05lZ2F0aXZlLFxuICAgICAgZGVjaW1hbCxcbiAgICAgIHByZWNpc2lvbixcbiAgICAgIHByZWZpeCxcbiAgICAgIHN1ZmZpeCxcbiAgICAgIHRob3VzYW5kcyxcbiAgICAgIG1pbixcbiAgICAgIGlucHV0TW9kZSxcbiAgICB9ID0gdGhpcy5fb3B0aW9ucztcblxuICAgIGxldCB7IG1heCB9ID0gdGhpcy5fb3B0aW9ucztcblxuICAgIHJhd1ZhbHVlID0gaXNOdW1iZXIgPyBuZXcgTnVtYmVyKHJhd1ZhbHVlKS50b0ZpeGVkKHByZWNpc2lvbikgOiByYXdWYWx1ZTtcbiAgICBsZXQgb25seU51bWJlcnMgPSByYXdWYWx1ZS5yZXBsYWNlKHRoaXMuX29ubHlOdW1iZXJzUmVnZXgsICcnKTtcblxuICAgIGlmICghb25seU51bWJlcnMgJiYgcmF3VmFsdWUgIT09IGRlY2ltYWwpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBpbnB1dE1vZGUgPT09IE5neEN1cnJlbmN5SW5wdXRNb2RlLk5hdHVyYWwgJiZcbiAgICAgICFpc051bWJlciAmJlxuICAgICAgIWRpc2FibGVQYWRBbmRUcmltXG4gICAgKSB7XG4gICAgICByYXdWYWx1ZSA9IHRoaXMucGFkT3JUcmltUHJlY2lzaW9uKHJhd1ZhbHVlKTtcbiAgICAgIG9ubHlOdW1iZXJzID0gcmF3VmFsdWUucmVwbGFjZSh0aGlzLl9vbmx5TnVtYmVyc1JlZ2V4LCAnJyk7XG4gICAgfVxuXG4gICAgbGV0IGludGVnZXJQYXJ0ID0gb25seU51bWJlcnNcbiAgICAgIC5zbGljZSgwLCBvbmx5TnVtYmVycy5sZW5ndGggLSBwcmVjaXNpb24pXG4gICAgICAucmVwbGFjZSgvXlxcdTA2NjAqL2csICcnKVxuICAgICAgLnJlcGxhY2UoL15cXHUwNkYwKi9nLCAnJylcbiAgICAgIC5yZXBsYWNlKC9eMCovZywgJycpO1xuXG4gICAgaWYgKGludGVnZXJQYXJ0ID09ICcnKSB7XG4gICAgICBpbnRlZ2VyUGFydCA9ICcwJztcbiAgICB9XG4gICAgY29uc3QgaW50ZWdlclZhbHVlID0gcGFyc2VJbnQoaW50ZWdlclBhcnQpO1xuXG4gICAgaW50ZWdlclBhcnQgPSBpbnRlZ2VyUGFydC5yZXBsYWNlKFxuICAgICAgL1xcQig/PShbMC05XFx1MDY2MC1cXHUwNjY5XFx1MDZGMC1cXHUwNkY5XXszfSkrKD8hWzAtOVxcdTA2NjAtXFx1MDY2OVxcdTA2RjAtXFx1MDZGOV0pKS9nLFxuICAgICAgdGhvdXNhbmRzLFxuICAgICk7XG4gICAgaWYgKHRob3VzYW5kcyAmJiBpbnRlZ2VyUGFydC5zdGFydHNXaXRoKHRob3VzYW5kcykpIHtcbiAgICAgIGludGVnZXJQYXJ0ID0gaW50ZWdlclBhcnQuc3Vic3RyaW5nKDEpO1xuICAgIH1cblxuICAgIGxldCBuZXdSYXdWYWx1ZSA9IGludGVnZXJQYXJ0O1xuICAgIGNvbnN0IGRlY2ltYWxQYXJ0ID0gb25seU51bWJlcnMuc2xpY2Uob25seU51bWJlcnMubGVuZ3RoIC0gcHJlY2lzaW9uKTtcbiAgICBjb25zdCBkZWNpbWFsVmFsdWUgPSBwYXJzZUludChkZWNpbWFsUGFydCkgfHwgMDtcblxuICAgIGNvbnN0IGlzTmVnYXRpdmUgPSByYXdWYWx1ZS5pbmRleE9mKCctJykgPiAtMTtcblxuICAgIC8vIEVuc3VyZSBtYXggaXMgYXQgbGVhc3QgYXMgbGFyZ2UgYXMgbWluLlxuICAgIG1heCA9XG4gICAgICBtYXggPT09IG51bGwgfHwgbWF4ID09PSB1bmRlZmluZWQgfHwgbWluID09PSBudWxsIHx8IG1pbiA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gbWF4XG4gICAgICAgIDogTWF0aC5tYXgobWF4LCBtaW4pO1xuXG4gICAgLy8gRW5zdXJlIHByZWNpc2lvbiBudW1iZXIgd29ya3Mgd2VsbCB3aXRoIG1vcmUgdGhhbiAyIGRpZ2l0c1xuICAgIC8vIDIzIC8gMTAwLi4uIDIzMyAvIDEwMDAgYW5kIHNvIG9uXG4gICAgY29uc3QgZGl2aWRlQnkgPSBOdW1iZXIoJzEnLnBhZEVuZChwcmVjaXNpb24gKyAxLCAnMCcpKTtcblxuICAgIC8vIFJlc3RyaWN0IHRvIHRoZSBtaW4gYW5kIG1heCB2YWx1ZXMuXG4gICAgbGV0IG5ld1ZhbHVlID0gaW50ZWdlclZhbHVlICsgZGVjaW1hbFZhbHVlIC8gZGl2aWRlQnk7XG5cbiAgICBuZXdWYWx1ZSA9IGlzTmVnYXRpdmUgPyAtbmV3VmFsdWUgOiBuZXdWYWx1ZTtcbiAgICBpZiAobWF4ICE9PSBudWxsICYmIG1heCAhPT0gdW5kZWZpbmVkICYmIG5ld1ZhbHVlID4gbWF4KSB7XG4gICAgICByZXR1cm4gdGhpcy5hcHBseU1hc2sodHJ1ZSwgbWF4ICsgJycpO1xuICAgIH0gZWxzZSBpZiAobWluICE9PSBudWxsICYmIG1pbiAhPT0gdW5kZWZpbmVkICYmIG5ld1ZhbHVlIDwgbWluKSB7XG4gICAgICByZXR1cm4gdGhpcy5hcHBseU1hc2sodHJ1ZSwgbWluICsgJycpO1xuICAgIH1cblxuICAgIGlmIChwcmVjaXNpb24gPiAwKSB7XG4gICAgICBpZiAobmV3UmF3VmFsdWUgPT0gJzAnICYmIGRlY2ltYWxQYXJ0Lmxlbmd0aCA8IHByZWNpc2lvbikge1xuICAgICAgICBuZXdSYXdWYWx1ZSArPSBkZWNpbWFsICsgJzAnLnJlcGVhdChwcmVjaXNpb24gLSAxKSArIGRlY2ltYWxQYXJ0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3UmF3VmFsdWUgKz0gZGVjaW1hbCArIGRlY2ltYWxQYXJ0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGxldCBpc1plcm8gPSBuZXdWYWx1ZSA9PSAwO1xuICAgIGNvbnN0IG9wZXJhdG9yID0gaXNOZWdhdGl2ZSAmJiBhbGxvd05lZ2F0aXZlIC8qJiYgIWlzWmVybyAqLyA/ICctJyA6ICcnO1xuICAgIHJldHVybiBvcGVyYXRvciArIHByZWZpeCArIG5ld1Jhd1ZhbHVlICsgc3VmZml4O1xuICB9XG5cbiAgcGFkT3JUcmltUHJlY2lzaW9uKHJhd1ZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgZGVjaW1hbCwgcHJlY2lzaW9uIH0gPSB0aGlzLl9vcHRpb25zO1xuXG4gICAgbGV0IGRlY2ltYWxJbmRleCA9IHJhd1ZhbHVlLmxhc3RJbmRleE9mKGRlY2ltYWwpO1xuICAgIGlmIChkZWNpbWFsSW5kZXggPT09IC0xKSB7XG4gICAgICBkZWNpbWFsSW5kZXggPSByYXdWYWx1ZS5sZW5ndGg7XG4gICAgICByYXdWYWx1ZSArPSBkZWNpbWFsO1xuICAgIH1cblxuICAgIGxldCBkZWNpbWFsUG9ydGlvbiA9IHJhd1ZhbHVlXG4gICAgICAuc3Vic3RyaW5nKGRlY2ltYWxJbmRleClcbiAgICAgIC5yZXBsYWNlKHRoaXMuX29ubHlOdW1iZXJzUmVnZXgsICcnKTtcbiAgICBjb25zdCBhY3R1YWxQcmVjaXNpb24gPSBkZWNpbWFsUG9ydGlvbi5sZW5ndGg7XG4gICAgaWYgKGFjdHVhbFByZWNpc2lvbiA8IHByZWNpc2lvbikge1xuICAgICAgZm9yIChsZXQgaSA9IGFjdHVhbFByZWNpc2lvbjsgaSA8IHByZWNpc2lvbjsgaSsrKSB7XG4gICAgICAgIGRlY2ltYWxQb3J0aW9uICs9ICcwJztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFjdHVhbFByZWNpc2lvbiA+IHByZWNpc2lvbikge1xuICAgICAgZGVjaW1hbFBvcnRpb24gPSBkZWNpbWFsUG9ydGlvbi5zdWJzdHJpbmcoXG4gICAgICAgIDAsXG4gICAgICAgIGRlY2ltYWxQb3J0aW9uLmxlbmd0aCArIHByZWNpc2lvbiAtIGFjdHVhbFByZWNpc2lvbixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhd1ZhbHVlLnN1YnN0cmluZygwLCBkZWNpbWFsSW5kZXgpICsgZGVjaW1hbCArIGRlY2ltYWxQb3J0aW9uO1xuICB9XG5cbiAgY2xlYXJNYXNrKHJhd1ZhbHVlOiBzdHJpbmcgfCBudWxsKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgaWYgKHRoaXMuaXNOdWxsYWJsZSgpICYmIHJhd1ZhbHVlID09PSAnJykgcmV0dXJuIG51bGw7XG5cbiAgICBsZXQgdmFsdWUgPSAocmF3VmFsdWUgfHwgJzAnKVxuICAgICAgLnJlcGxhY2UodGhpcy5fb3B0aW9ucy5wcmVmaXgsICcnKVxuICAgICAgLnJlcGxhY2UodGhpcy5fb3B0aW9ucy5zdWZmaXgsICcnKTtcblxuICAgIGlmICh0aGlzLl9vcHRpb25zLnRob3VzYW5kcykge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKFxuICAgICAgICBuZXcgUmVnRXhwKCdcXFxcJyArIHRoaXMuX29wdGlvbnMudGhvdXNhbmRzLCAnZycpLFxuICAgICAgICAnJyxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuZGVjaW1hbCkge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKHRoaXMuX29wdGlvbnMuZGVjaW1hbCwgJy4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl9wZXJBck51bWJlci5mb3JFYWNoKCh2YWw6IHN0cmluZywga2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChrZXksICdnJyk7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmUsIHZhbCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpO1xuICB9XG5cbiAgY2hhbmdlVG9OZWdhdGl2ZSgpOiB2b2lkIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLl9vcHRpb25zLmFsbG93TmVnYXRpdmUgLyomJiB0aGlzLnJhd1ZhbHVlICE9IFwiXCIqLyAmJlxuICAgICAgdGhpcy5yYXdWYWx1ZT8uY2hhckF0KDApICE9ICctJyAvKiYmIHRoaXMudmFsdWUgIT0gMCovXG4gICAgKSB7XG4gICAgICAvLyBBcHBseSB0aGUgbWFzayB0byBlbnN1cmUgdGhlIG1pbiBhbmQgbWF4IHZhbHVlcyBhcmUgZW5mb3JjZWQuXG4gICAgICB0aGlzLnJhd1ZhbHVlID0gdGhpcy5hcHBseU1hc2soXG4gICAgICAgIGZhbHNlLFxuICAgICAgICAnLScgKyAodGhpcy5yYXdWYWx1ZSA/IHRoaXMucmF3VmFsdWUgOiAnMCcpLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VUb1Bvc2l0aXZlKCk6IHZvaWQge1xuICAgIC8vIEFwcGx5IHRoZSBtYXNrIHRvIGVuc3VyZSB0aGUgbWluIGFuZCBtYXggdmFsdWVzIGFyZSBlbmZvcmNlZC5cbiAgICB0aGlzLnJhd1ZhbHVlID0gdGhpcy5hcHBseU1hc2soXG4gICAgICBmYWxzZSxcbiAgICAgIHRoaXMucmF3VmFsdWU/LnJlcGxhY2UoJy0nLCAnJykgPz8gJycsXG4gICAgKTtcbiAgfVxuXG4gIHJlbW92ZU51bWJlcihrZXlDb2RlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB7IGRlY2ltYWwsIHRob3VzYW5kcywgcHJlZml4LCBzdWZmaXgsIGlucHV0TW9kZSB9ID0gdGhpcy5fb3B0aW9ucztcblxuICAgIGlmICh0aGlzLmlzTnVsbGFibGUoKSAmJiB0aGlzLnZhbHVlID09IDApIHtcbiAgICAgIHRoaXMucmF3VmFsdWUgPSBudWxsO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBzZWxlY3Rpb25FbmQgPSB0aGlzLmlucHV0U2VsZWN0aW9uLnNlbGVjdGlvbkVuZDtcbiAgICBsZXQgc2VsZWN0aW9uU3RhcnQgPSB0aGlzLmlucHV0U2VsZWN0aW9uLnNlbGVjdGlvblN0YXJ0O1xuXG4gICAgY29uc3Qgc3VmZml4U3RhcnQgPSAodGhpcy5yYXdWYWx1ZT8ubGVuZ3RoID8/IDApIC0gc3VmZml4Lmxlbmd0aDtcbiAgICBzZWxlY3Rpb25FbmQgPSBNYXRoLm1pbihzdWZmaXhTdGFydCwgTWF0aC5tYXgoc2VsZWN0aW9uRW5kLCBwcmVmaXgubGVuZ3RoKSk7XG4gICAgc2VsZWN0aW9uU3RhcnQgPSBNYXRoLm1pbihcbiAgICAgIHN1ZmZpeFN0YXJ0LFxuICAgICAgTWF0aC5tYXgoc2VsZWN0aW9uU3RhcnQsIHByZWZpeC5sZW5ndGgpLFxuICAgICk7XG5cbiAgICAvLyBDaGVjayBpZiBzZWxlY3Rpb24gd2FzIGVudGlyZWx5IGluIHRoZSBwcmVmaXggb3Igc3VmZml4LlxuICAgIGlmIChcbiAgICAgIHNlbGVjdGlvblN0YXJ0ID09PSBzZWxlY3Rpb25FbmQgJiZcbiAgICAgIHRoaXMuaW5wdXRTZWxlY3Rpb24uc2VsZWN0aW9uU3RhcnQgIT09IHRoaXMuaW5wdXRTZWxlY3Rpb24uc2VsZWN0aW9uRW5kXG4gICAgKSB7XG4gICAgICB0aGlzLnVwZGF0ZUZpZWxkVmFsdWUoc2VsZWN0aW9uU3RhcnQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBkZWNpbWFsSW5kZXggPSB0aGlzLnJhd1ZhbHVlPy5pbmRleE9mKGRlY2ltYWwpID8/IC0xO1xuICAgIGlmIChkZWNpbWFsSW5kZXggPT09IC0xKSB7XG4gICAgICBkZWNpbWFsSW5kZXggPSB0aGlzLnJhd1ZhbHVlPy5sZW5ndGggPz8gMDtcbiAgICB9XG5cbiAgICBsZXQgc2hpZnRTZWxlY3Rpb24gPSAwO1xuICAgIGxldCBpbnNlcnRDaGFycyA9ICcnO1xuXG4gICAgY29uc3QgaXNDdXJzb3JJbkRlY2ltYWxzID0gZGVjaW1hbEluZGV4IDwgc2VsZWN0aW9uRW5kO1xuICAgIGNvbnN0IGlzQ3Vyc29ySW1tZWRpYXRlbHlBZnRlckRlY2ltYWxQb2ludCA9XG4gICAgICBkZWNpbWFsSW5kZXggKyAxID09PSBzZWxlY3Rpb25FbmQ7XG5cbiAgICBpZiAoc2VsZWN0aW9uRW5kID09PSBzZWxlY3Rpb25TdGFydCkge1xuICAgICAgaWYgKGtleUNvZGUgPT0gOCkge1xuICAgICAgICBpZiAoc2VsZWN0aW9uU3RhcnQgPD0gcHJlZml4Lmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rpb25TdGFydC0tO1xuXG4gICAgICAgIC8vIElmIHByZXZpb3VzIGNoYXIgaXNuJ3QgYSBudW1iZXIsIGdvIGJhY2sgb25lIG1vcmUuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAhdGhpcy5yYXdWYWx1ZVxuICAgICAgICAgICAgPy5zdWJzdHJpbmcoc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvblN0YXJ0ICsgMSlcbiAgICAgICAgICAgIC5tYXRjaCgvXFxkLylcbiAgICAgICAgKSB7XG4gICAgICAgICAgc2VsZWN0aW9uU3RhcnQtLTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluIG5hdHVyYWwgbW9kZSwganVtcCBiYWNrd2FyZHMgd2hlbiBpbiBkZWNpbWFsIHBvcnRpb24gb2YgbnVtYmVyLlxuICAgICAgICBpZiAoaW5wdXRNb2RlID09PSBOZ3hDdXJyZW5jeUlucHV0TW9kZS5OYXR1cmFsICYmIGlzQ3Vyc29ySW5EZWNpbWFscykge1xuICAgICAgICAgIHNoaWZ0U2VsZWN0aW9uID0gLTE7XG4gICAgICAgICAgLy8gd2hlbiByZW1vdmluZyBhIHNpbmdsZSB3aG9sZSBudW1iZXIsIHJlcGxhY2UgaXQgd2l0aCAwXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaXNDdXJzb3JJbW1lZGlhdGVseUFmdGVyRGVjaW1hbFBvaW50ICYmXG4gICAgICAgICAgICAodGhpcy52YWx1ZSA/PyAwKSA8IDEwICYmXG4gICAgICAgICAgICAodGhpcy52YWx1ZSA/PyAwKSA+IC0xMFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgaW5zZXJ0Q2hhcnMgKz0gJzAnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChrZXlDb2RlID09IDQ2IHx8IGtleUNvZGUgPT0gNjMyNzIpIHtcbiAgICAgICAgaWYgKHNlbGVjdGlvblN0YXJ0ID09PSBzdWZmaXhTdGFydCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rpb25FbmQrKztcblxuICAgICAgICAvLyBJZiBuZXh0IGNoYXIgaXNuJ3QgYSBudW1iZXIsIGdvIG9uZSBtb3JlLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgIXRoaXMucmF3VmFsdWVcbiAgICAgICAgICAgID8uc3Vic3RyaW5nKHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25TdGFydCArIDEpXG4gICAgICAgICAgICAubWF0Y2goL1xcZC8pXG4gICAgICAgICkge1xuICAgICAgICAgIHNlbGVjdGlvblN0YXJ0Kys7XG4gICAgICAgICAgc2VsZWN0aW9uRW5kKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbiBuYXR1cmFsIG1vZGUsIHJlcGxhY2UgZGVjaW1hbHMgd2l0aCAwcy5cbiAgICBpZiAoXG4gICAgICBpbnB1dE1vZGUgPT09IE5neEN1cnJlbmN5SW5wdXRNb2RlLk5hdHVyYWwgJiZcbiAgICAgIHNlbGVjdGlvblN0YXJ0ID4gZGVjaW1hbEluZGV4XG4gICAgKSB7XG4gICAgICBjb25zdCByZXBsYWNlZERlY2ltYWxDb3VudCA9IHNlbGVjdGlvbkVuZCAtIHNlbGVjdGlvblN0YXJ0O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXBsYWNlZERlY2ltYWxDb3VudDsgaSsrKSB7XG4gICAgICAgIGluc2VydENoYXJzICs9ICcwJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgc2VsZWN0aW9uRnJvbUVuZCA9ICh0aGlzLnJhd1ZhbHVlPy5sZW5ndGggPz8gMCkgLSBzZWxlY3Rpb25FbmQ7XG4gICAgdGhpcy5yYXdWYWx1ZSA9XG4gICAgICB0aGlzLnJhd1ZhbHVlPy5zdWJzdHJpbmcoMCwgc2VsZWN0aW9uU3RhcnQpICtcbiAgICAgIGluc2VydENoYXJzICtcbiAgICAgIHRoaXMucmF3VmFsdWU/LnN1YnN0cmluZyhzZWxlY3Rpb25FbmQpO1xuXG4gICAgLy8gUmVtb3ZlIGxlYWRpbmcgdGhvdXNhbmQgc2VwYXJhdG9yIGZyb20gcmF3IHZhbHVlLlxuICAgIGNvbnN0IHN0YXJ0Q2hhciA9IHRoaXMucmF3VmFsdWUuc3Vic3RyaW5nKHByZWZpeC5sZW5ndGgsIHByZWZpeC5sZW5ndGggKyAxKTtcbiAgICBpZiAoc3RhcnRDaGFyID09PSB0aG91c2FuZHMpIHtcbiAgICAgIHRoaXMucmF3VmFsdWUgPVxuICAgICAgICB0aGlzLnJhd1ZhbHVlLnN1YnN0cmluZygwLCBwcmVmaXgubGVuZ3RoKSArXG4gICAgICAgIHRoaXMucmF3VmFsdWUuc3Vic3RyaW5nKHByZWZpeC5sZW5ndGggKyAxKTtcbiAgICAgIHNlbGVjdGlvbkZyb21FbmQgPSBNYXRoLm1pbihcbiAgICAgICAgc2VsZWN0aW9uRnJvbUVuZCxcbiAgICAgICAgdGhpcy5yYXdWYWx1ZS5sZW5ndGggLSBwcmVmaXgubGVuZ3RoLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUZpZWxkVmFsdWUoXG4gICAgICB0aGlzLnJhd1ZhbHVlLmxlbmd0aCAtIHNlbGVjdGlvbkZyb21FbmQgKyBzaGlmdFNlbGVjdGlvbixcbiAgICAgIHRydWUsXG4gICAgKTtcbiAgfVxuXG4gIHVwZGF0ZUZpZWxkVmFsdWUoc2VsZWN0aW9uU3RhcnQ/OiBudW1iZXIsIGRpc2FibGVQYWRBbmRUcmltID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBuZXdSYXdWYWx1ZSA9IHRoaXMuYXBwbHlNYXNrKFxuICAgICAgZmFsc2UsXG4gICAgICB0aGlzLnJhd1ZhbHVlID8/ICcnLFxuICAgICAgZGlzYWJsZVBhZEFuZFRyaW0sXG4gICAgKTtcbiAgICBzZWxlY3Rpb25TdGFydCA/Pz0gdGhpcy5yYXdWYWx1ZT8ubGVuZ3RoID8/IDA7XG4gICAgc2VsZWN0aW9uU3RhcnQgPSBNYXRoLm1heChcbiAgICAgIHRoaXMuX29wdGlvbnMucHJlZml4Lmxlbmd0aCxcbiAgICAgIE1hdGgubWluKFxuICAgICAgICBzZWxlY3Rpb25TdGFydCxcbiAgICAgICAgKHRoaXMucmF3VmFsdWU/Lmxlbmd0aCA/PyAwKSAtIHRoaXMuX29wdGlvbnMuc3VmZml4Lmxlbmd0aCxcbiAgICAgICksXG4gICAgKTtcbiAgICB0aGlzLmlucHV0TWFuYWdlci51cGRhdGVWYWx1ZUFuZEN1cnNvcihcbiAgICAgIG5ld1Jhd1ZhbHVlLFxuICAgICAgdGhpcy5yYXdWYWx1ZT8ubGVuZ3RoID8/IDAsXG4gICAgICBzZWxlY3Rpb25TdGFydCxcbiAgICApO1xuICB9XG5cbiAgdXBkYXRlT3B0aW9ucyhvcHRpb25zOiBOZ3hDdXJyZW5jeUNvbmZpZyk6IHZvaWQge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwcmVmaXhMZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy5wcmVmaXgubGVuZ3RoO1xuICB9XG5cbiAgc3VmZml4TGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnMuc3VmZml4Lmxlbmd0aDtcbiAgfVxuXG4gIGlzTnVsbGFibGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnMubnVsbGFibGU7XG4gIH1cblxuICBnZXQgY2FuSW5wdXRNb3JlTnVtYmVycygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dE1hbmFnZXIuY2FuSW5wdXRNb3JlTnVtYmVycztcbiAgfVxuXG4gIGdldCBpbnB1dFNlbGVjdGlvbigpOiB7XG4gICAgc2VsZWN0aW9uU3RhcnQ6IG51bWJlcjtcbiAgICBzZWxlY3Rpb25FbmQ6IG51bWJlcjtcbiAgfSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXRNYW5hZ2VyLmlucHV0U2VsZWN0aW9uO1xuICB9XG5cbiAgZ2V0IHJhd1ZhbHVlKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmlucHV0TWFuYWdlci5yYXdWYWx1ZTtcbiAgfVxuXG4gIHNldCByYXdWYWx1ZSh2YWx1ZTogc3RyaW5nIHwgbnVsbCkge1xuICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnJhd1ZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBnZXQgc3RvcmVkUmF3VmFsdWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dE1hbmFnZXIuc3RvcmVkUmF3VmFsdWU7XG4gIH1cblxuICBnZXQgdmFsdWUoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY2xlYXJNYXNrKHRoaXMucmF3VmFsdWUpO1xuICB9XG5cbiAgc2V0IHZhbHVlKHZhbHVlOiBudW1iZXIgfCBudWxsKSB7XG4gICAgdGhpcy5yYXdWYWx1ZSA9IHRoaXMuYXBwbHlNYXNrKHRydWUsICcnICsgdmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaXNOdWxsT3JVbmRlZmluZWQodmFsdWU6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbiAgfVxufVxuIl19