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
        selectionStart ?? (selectionStart = this.rawValue?.length ?? 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jdXJyZW5jeS9zcmMvbGliL2lucHV0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBcUIsb0JBQW9CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVoRixNQUFNLE9BQU8sWUFBWTtJQWtDdkIsWUFDRSxnQkFBa0MsRUFDMUIsUUFBMkI7UUFBM0IsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7UUFuQ3BCLHNCQUFpQixHQUFHLElBQUksTUFBTSxDQUM3QyxtQ0FBbUMsQ0FDcEMsQ0FBQztRQUNlLHNCQUFpQixHQUFHLElBQUksTUFBTSxDQUM3QyxtQ0FBbUMsQ0FDcEMsQ0FBQztRQUVlLGlCQUFZLEdBQUcsSUFBSSxHQUFHLENBQWlCO1lBQ3RELENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUVmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcs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QUFrQixDQUFDLEtBQWdDO1FBQ3pELE9BQU8sS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssU0FBUyxDQUFDO0lBQy9DLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElucHV0TWFuYWdlciB9IGZyb20gJy4vaW5wdXQubWFuYWdlcic7XG5pbXBvcnQgeyBOZ3hDdXJyZW5jeUNvbmZpZywgTmd4Q3VycmVuY3lJbnB1dE1vZGUgfSBmcm9tICcuL25neC1jdXJyZW5jeS5jb25maWcnO1xuXG5leHBvcnQgY2xhc3MgSW5wdXRTZXJ2aWNlIHtcbiAgcHJpdmF0ZSByZWFkb25seSBfc2luZ2xlRGlnaXRSZWdleCA9IG5ldyBSZWdFeHAoXG4gICAgL15bMC05XFx1MDY2MC1cXHUwNjY5XFx1MDZGMC1cXHUwNkY5XSQvXG4gICk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX29ubHlOdW1iZXJzUmVnZXggPSBuZXcgUmVnRXhwKFxuICAgIC9bXjAtOVxcdTA2NjAtXFx1MDY2OVxcdTA2RjAtXFx1MDZGOV0vZ1xuICApO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX3BlckFyTnVtYmVyID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oW1xuICAgIFsnXFx1MDZGMCcsICcwJ10sXG4gICAgWydcXHUwNkYxJywgJzEnXSxcbiAgICBbJ1xcdTA2RjInLCAnMiddLFxuICAgIFsnXFx1MDZGMycsICczJ10sXG4gICAgWydcXHUwNkY0JywgJzQnXSxcbiAgICBbJ1xcdTA2RjUnLCAnNSddLFxuICAgIFsnXFx1MDZGNicsICc2J10sXG4gICAgWydcXHUwNkY3JywgJzcnXSxcbiAgICBbJ1xcdTA2RjgnLCAnOCddLFxuICAgIFsnXFx1MDZGOScsICc5J10sXG5cbiAgICBbJ1xcdTA2NjAnLCAnMCddLFxuICAgIFsnXFx1MDY2MScsICcxJ10sXG4gICAgWydcXHUwNjYyJywgJzInXSxcbiAgICBbJ1xcdTA2NjMnLCAnMyddLFxuICAgIFsnXFx1MDY2NCcsICc0J10sXG4gICAgWydcXHUwNjY1JywgJzUnXSxcbiAgICBbJ1xcdTA2NjYnLCAnNiddLFxuICAgIFsnXFx1MDY2NycsICc3J10sXG4gICAgWydcXHUwNjY4JywgJzgnXSxcbiAgICBbJ1xcdTA2NjknLCAnOSddLFxuICBdKTtcblxuICBpbnB1dE1hbmFnZXI6IElucHV0TWFuYWdlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBodG1sSW5wdXRFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50LFxuICAgIHByaXZhdGUgX29wdGlvbnM6IE5neEN1cnJlbmN5Q29uZmlnXG4gICkge1xuICAgIHRoaXMuaW5wdXRNYW5hZ2VyID0gbmV3IElucHV0TWFuYWdlcihodG1sSW5wdXRFbGVtZW50KTtcbiAgfVxuXG4gIGFkZE51bWJlcihrZXlDb2RlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB7IGRlY2ltYWwsIHByZWNpc2lvbiwgaW5wdXRNb2RlIH0gPSB0aGlzLl9vcHRpb25zO1xuICAgIGNvbnN0IGtleUNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUpO1xuICAgIGNvbnN0IGlzRGVjaW1hbENoYXIgPSBrZXlDaGFyID09PSB0aGlzLl9vcHRpb25zLmRlY2ltYWw7XG5cbiAgICBpZiAoIXRoaXMucmF3VmFsdWUpIHtcbiAgICAgIHRoaXMucmF3VmFsdWUgPSB0aGlzLmFwcGx5TWFzayhmYWxzZSwga2V5Q2hhcik7XG4gICAgICBsZXQgc2VsZWN0aW9uU3RhcnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAgIGlmIChpbnB1dE1vZGUgPT09IE5neEN1cnJlbmN5SW5wdXRNb2RlLk5hdHVyYWwgJiYgcHJlY2lzaW9uID4gMCkge1xuICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHRoaXMucmF3VmFsdWUuaW5kZXhPZihkZWNpbWFsKTtcbiAgICAgICAgaWYgKGlzRGVjaW1hbENoYXIpIHtcbiAgICAgICAgICBzZWxlY3Rpb25TdGFydCsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZUZpZWxkVmFsdWUoc2VsZWN0aW9uU3RhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzZWxlY3Rpb25TdGFydCA9IHRoaXMuaW5wdXRTZWxlY3Rpb24uc2VsZWN0aW9uU3RhcnQ7XG4gICAgICBjb25zdCBzZWxlY3Rpb25FbmQgPSB0aGlzLmlucHV0U2VsZWN0aW9uLnNlbGVjdGlvbkVuZDtcbiAgICAgIGNvbnN0IHJhd1ZhbHVlU3RhcnQgPSB0aGlzLnJhd1ZhbHVlLnN1YnN0cmluZygwLCBzZWxlY3Rpb25TdGFydCk7XG4gICAgICBsZXQgcmF3VmFsdWVFbmQgPSB0aGlzLnJhd1ZhbHVlLnN1YnN0cmluZyhcbiAgICAgICAgc2VsZWN0aW9uRW5kLFxuICAgICAgICB0aGlzLnJhd1ZhbHVlLmxlbmd0aFxuICAgICAgKTtcblxuICAgICAgLy8gSW4gbmF0dXJhbCBtb2RlLCByZXBsYWNlIGRlY2ltYWxzIGluc3RlYWQgb2Ygc2hpZnRpbmcgdGhlbS5cbiAgICAgIGNvbnN0IGluRGVjaW1hbFBvcnRpb24gPSByYXdWYWx1ZVN0YXJ0LmluZGV4T2YoZGVjaW1hbCkgIT09IC0xO1xuICAgICAgaWYgKFxuICAgICAgICBpbnB1dE1vZGUgPT09IE5neEN1cnJlbmN5SW5wdXRNb2RlLk5hdHVyYWwgJiZcbiAgICAgICAgaW5EZWNpbWFsUG9ydGlvbiAmJlxuICAgICAgICBzZWxlY3Rpb25TdGFydCA9PT0gc2VsZWN0aW9uRW5kXG4gICAgICApIHtcbiAgICAgICAgcmF3VmFsdWVFbmQgPSByYXdWYWx1ZUVuZC5zdWJzdHJpbmcoMSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gcmF3VmFsdWVTdGFydCArIGtleUNoYXIgKyByYXdWYWx1ZUVuZDtcbiAgICAgIGxldCBuZXh0U2VsZWN0aW9uU3RhcnQgPSBzZWxlY3Rpb25TdGFydCArIDE7XG4gICAgICBjb25zdCBpc0RlY2ltYWxPclRob3VzYW5kcyA9XG4gICAgICAgIGlzRGVjaW1hbENoYXIgfHwga2V5Q2hhciA9PT0gdGhpcy5fb3B0aW9ucy50aG91c2FuZHM7XG4gICAgICBpZiAoaXNEZWNpbWFsT3JUaG91c2FuZHMgJiYga2V5Q2hhciA9PT0gcmF3VmFsdWVFbmRbMF0pIHtcbiAgICAgICAgLy8gSWYgdGhlIGN1cnNvciBpcyBqdXN0IGJlZm9yZSB0aGUgZGVjaW1hbCBvciB0aG91c2FuZHMgc2VwYXJhdG9yIGFuZCB0aGUgdXNlciB0eXBlcyB0aGVcbiAgICAgICAgLy8gZGVjaW1hbCBvciB0aG91c2FuZHMgc2VwYXJhdG9yLCBtb3ZlIHRoZSBjdXJzb3IgcGFzdCBpdC5cbiAgICAgICAgbmV4dFNlbGVjdGlvblN0YXJ0Kys7XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLl9zaW5nbGVEaWdpdFJlZ2V4LnRlc3Qoa2V5Q2hhcikpIHtcbiAgICAgICAgLy8gSWdub3JlIG90aGVyIG5vbi1udW1iZXJzLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmF3VmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgIHRoaXMudXBkYXRlRmllbGRWYWx1ZShuZXh0U2VsZWN0aW9uU3RhcnQpO1xuICAgIH1cbiAgfVxuXG4gIGFwcGx5TWFzayhcbiAgICBpc051bWJlcjogYm9vbGVhbixcbiAgICByYXdWYWx1ZTogc3RyaW5nLFxuICAgIGRpc2FibGVQYWRBbmRUcmltID0gZmFsc2VcbiAgKTogc3RyaW5nIHtcbiAgICBjb25zdCB7XG4gICAgICBhbGxvd05lZ2F0aXZlLFxuICAgICAgZGVjaW1hbCxcbiAgICAgIHByZWNpc2lvbixcbiAgICAgIHByZWZpeCxcbiAgICAgIHN1ZmZpeCxcbiAgICAgIHRob3VzYW5kcyxcbiAgICAgIG1pbixcbiAgICAgIGlucHV0TW9kZSxcbiAgICB9ID0gdGhpcy5fb3B0aW9ucztcblxuICAgIGxldCB7IG1heCB9ID0gdGhpcy5fb3B0aW9ucztcblxuICAgIHJhd1ZhbHVlID0gaXNOdW1iZXIgPyBuZXcgTnVtYmVyKHJhd1ZhbHVlKS50b0ZpeGVkKHByZWNpc2lvbikgOiByYXdWYWx1ZTtcbiAgICBsZXQgb25seU51bWJlcnMgPSByYXdWYWx1ZS5yZXBsYWNlKHRoaXMuX29ubHlOdW1iZXJzUmVnZXgsICcnKTtcblxuICAgIGlmICghb25seU51bWJlcnMgJiYgcmF3VmFsdWUgIT09IGRlY2ltYWwpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBpbnB1dE1vZGUgPT09IE5neEN1cnJlbmN5SW5wdXRNb2RlLk5hdHVyYWwgJiZcbiAgICAgICFpc051bWJlciAmJlxuICAgICAgIWRpc2FibGVQYWRBbmRUcmltXG4gICAgKSB7XG4gICAgICByYXdWYWx1ZSA9IHRoaXMucGFkT3JUcmltUHJlY2lzaW9uKHJhd1ZhbHVlKTtcbiAgICAgIG9ubHlOdW1iZXJzID0gcmF3VmFsdWUucmVwbGFjZSh0aGlzLl9vbmx5TnVtYmVyc1JlZ2V4LCAnJyk7XG4gICAgfVxuXG4gICAgbGV0IGludGVnZXJQYXJ0ID0gb25seU51bWJlcnNcbiAgICAgIC5zbGljZSgwLCBvbmx5TnVtYmVycy5sZW5ndGggLSBwcmVjaXNpb24pXG4gICAgICAucmVwbGFjZSgvXlxcdTA2NjAqL2csICcnKVxuICAgICAgLnJlcGxhY2UoL15cXHUwNkYwKi9nLCAnJylcbiAgICAgIC5yZXBsYWNlKC9eMCovZywgJycpO1xuXG4gICAgaWYgKGludGVnZXJQYXJ0ID09ICcnKSB7XG4gICAgICBpbnRlZ2VyUGFydCA9ICcwJztcbiAgICB9XG4gICAgY29uc3QgaW50ZWdlclZhbHVlID0gcGFyc2VJbnQoaW50ZWdlclBhcnQpO1xuXG4gICAgaW50ZWdlclBhcnQgPSBpbnRlZ2VyUGFydC5yZXBsYWNlKFxuICAgICAgL1xcQig/PShbMC05XFx1MDY2MC1cXHUwNjY5XFx1MDZGMC1cXHUwNkY5XXszfSkrKD8hWzAtOVxcdTA2NjAtXFx1MDY2OVxcdTA2RjAtXFx1MDZGOV0pKS9nLFxuICAgICAgdGhvdXNhbmRzXG4gICAgKTtcbiAgICBpZiAodGhvdXNhbmRzICYmIGludGVnZXJQYXJ0LnN0YXJ0c1dpdGgodGhvdXNhbmRzKSkge1xuICAgICAgaW50ZWdlclBhcnQgPSBpbnRlZ2VyUGFydC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgbGV0IG5ld1Jhd1ZhbHVlID0gaW50ZWdlclBhcnQ7XG4gICAgY29uc3QgZGVjaW1hbFBhcnQgPSBvbmx5TnVtYmVycy5zbGljZShvbmx5TnVtYmVycy5sZW5ndGggLSBwcmVjaXNpb24pO1xuICAgIGNvbnN0IGRlY2ltYWxWYWx1ZSA9IHBhcnNlSW50KGRlY2ltYWxQYXJ0KSB8fCAwO1xuXG4gICAgY29uc3QgaXNOZWdhdGl2ZSA9IHJhd1ZhbHVlLmluZGV4T2YoJy0nKSA+IC0xO1xuXG4gICAgLy8gRW5zdXJlIG1heCBpcyBhdCBsZWFzdCBhcyBsYXJnZSBhcyBtaW4uXG4gICAgbWF4ID1cbiAgICAgIG1heCA9PT0gbnVsbCB8fCBtYXggPT09IHVuZGVmaW5lZCB8fCBtaW4gPT09IG51bGwgfHwgbWluID09PSB1bmRlZmluZWRcbiAgICAgICAgPyBtYXhcbiAgICAgICAgOiBNYXRoLm1heChtYXgsIG1pbik7XG5cbiAgICAvLyBFbnN1cmUgcHJlY2lzaW9uIG51bWJlciB3b3JrcyB3ZWxsIHdpdGggbW9yZSB0aGFuIDIgZGlnaXRzXG4gICAgLy8gMjMgLyAxMDAuLi4gMjMzIC8gMTAwMCBhbmQgc28gb25cbiAgICBjb25zdCBkaXZpZGVCeSA9IE51bWJlcignMScucGFkRW5kKHByZWNpc2lvbiArIDEsICcwJykpO1xuXG4gICAgLy8gUmVzdHJpY3QgdG8gdGhlIG1pbiBhbmQgbWF4IHZhbHVlcy5cbiAgICBsZXQgbmV3VmFsdWUgPSBpbnRlZ2VyVmFsdWUgKyBkZWNpbWFsVmFsdWUgLyBkaXZpZGVCeTtcblxuICAgIG5ld1ZhbHVlID0gaXNOZWdhdGl2ZSA/IC1uZXdWYWx1ZSA6IG5ld1ZhbHVlO1xuICAgIGlmIChtYXggIT09IG51bGwgJiYgbWF4ICE9PSB1bmRlZmluZWQgJiYgbmV3VmFsdWUgPiBtYXgpIHtcbiAgICAgIHJldHVybiB0aGlzLmFwcGx5TWFzayh0cnVlLCBtYXggKyAnJyk7XG4gICAgfSBlbHNlIGlmIChtaW4gIT09IG51bGwgJiYgbWluICE9PSB1bmRlZmluZWQgJiYgbmV3VmFsdWUgPCBtaW4pIHtcbiAgICAgIHJldHVybiB0aGlzLmFwcGx5TWFzayh0cnVlLCBtaW4gKyAnJyk7XG4gICAgfVxuXG4gICAgaWYgKHByZWNpc2lvbiA+IDApIHtcbiAgICAgIGlmIChuZXdSYXdWYWx1ZSA9PSAnMCcgJiYgZGVjaW1hbFBhcnQubGVuZ3RoIDwgcHJlY2lzaW9uKSB7XG4gICAgICAgIG5ld1Jhd1ZhbHVlICs9IGRlY2ltYWwgKyAnMCcucmVwZWF0KHByZWNpc2lvbiAtIDEpICsgZGVjaW1hbFBhcnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdSYXdWYWx1ZSArPSBkZWNpbWFsICsgZGVjaW1hbFBhcnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbGV0IGlzWmVybyA9IG5ld1ZhbHVlID09IDA7XG4gICAgY29uc3Qgb3BlcmF0b3IgPSBpc05lZ2F0aXZlICYmIGFsbG93TmVnYXRpdmUgLyomJiAhaXNaZXJvICovID8gJy0nIDogJyc7XG4gICAgcmV0dXJuIG9wZXJhdG9yICsgcHJlZml4ICsgbmV3UmF3VmFsdWUgKyBzdWZmaXg7XG4gIH1cblxuICBwYWRPclRyaW1QcmVjaXNpb24ocmF3VmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgeyBkZWNpbWFsLCBwcmVjaXNpb24gfSA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICBsZXQgZGVjaW1hbEluZGV4ID0gcmF3VmFsdWUubGFzdEluZGV4T2YoZGVjaW1hbCk7XG4gICAgaWYgKGRlY2ltYWxJbmRleCA9PT0gLTEpIHtcbiAgICAgIGRlY2ltYWxJbmRleCA9IHJhd1ZhbHVlLmxlbmd0aDtcbiAgICAgIHJhd1ZhbHVlICs9IGRlY2ltYWw7XG4gICAgfVxuXG4gICAgbGV0IGRlY2ltYWxQb3J0aW9uID0gcmF3VmFsdWVcbiAgICAgIC5zdWJzdHJpbmcoZGVjaW1hbEluZGV4KVxuICAgICAgLnJlcGxhY2UodGhpcy5fb25seU51bWJlcnNSZWdleCwgJycpO1xuICAgIGNvbnN0IGFjdHVhbFByZWNpc2lvbiA9IGRlY2ltYWxQb3J0aW9uLmxlbmd0aDtcbiAgICBpZiAoYWN0dWFsUHJlY2lzaW9uIDwgcHJlY2lzaW9uKSB7XG4gICAgICBmb3IgKGxldCBpID0gYWN0dWFsUHJlY2lzaW9uOyBpIDwgcHJlY2lzaW9uOyBpKyspIHtcbiAgICAgICAgZGVjaW1hbFBvcnRpb24gKz0gJzAnO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYWN0dWFsUHJlY2lzaW9uID4gcHJlY2lzaW9uKSB7XG4gICAgICBkZWNpbWFsUG9ydGlvbiA9IGRlY2ltYWxQb3J0aW9uLnN1YnN0cmluZyhcbiAgICAgICAgMCxcbiAgICAgICAgZGVjaW1hbFBvcnRpb24ubGVuZ3RoICsgcHJlY2lzaW9uIC0gYWN0dWFsUHJlY2lzaW9uXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiByYXdWYWx1ZS5zdWJzdHJpbmcoMCwgZGVjaW1hbEluZGV4KSArIGRlY2ltYWwgKyBkZWNpbWFsUG9ydGlvbjtcbiAgfVxuXG4gIGNsZWFyTWFzayhyYXdWYWx1ZTogc3RyaW5nIHwgbnVsbCk6IG51bWJlciB8IG51bGwge1xuICAgIGlmICh0aGlzLmlzTnVsbGFibGUoKSAmJiByYXdWYWx1ZSA9PT0gJycpIHJldHVybiBudWxsO1xuXG4gICAgbGV0IHZhbHVlID0gKHJhd1ZhbHVlIHx8ICcwJylcbiAgICAgIC5yZXBsYWNlKHRoaXMuX29wdGlvbnMucHJlZml4LCAnJylcbiAgICAgIC5yZXBsYWNlKHRoaXMuX29wdGlvbnMuc3VmZml4LCAnJyk7XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy50aG91c2FuZHMpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZShcbiAgICAgICAgbmV3IFJlZ0V4cCgnXFxcXCcgKyB0aGlzLl9vcHRpb25zLnRob3VzYW5kcywgJ2cnKSxcbiAgICAgICAgJydcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuZGVjaW1hbCkge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKHRoaXMuX29wdGlvbnMuZGVjaW1hbCwgJy4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl9wZXJBck51bWJlci5mb3JFYWNoKCh2YWw6IHN0cmluZywga2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChrZXksICdnJyk7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmUsIHZhbCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpO1xuICB9XG5cbiAgY2hhbmdlVG9OZWdhdGl2ZSgpOiB2b2lkIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLl9vcHRpb25zLmFsbG93TmVnYXRpdmUgLyomJiB0aGlzLnJhd1ZhbHVlICE9IFwiXCIqLyAmJlxuICAgICAgdGhpcy5yYXdWYWx1ZT8uY2hhckF0KDApICE9ICctJyAvKiYmIHRoaXMudmFsdWUgIT0gMCovXG4gICAgKSB7XG4gICAgICAvLyBBcHBseSB0aGUgbWFzayB0byBlbnN1cmUgdGhlIG1pbiBhbmQgbWF4IHZhbHVlcyBhcmUgZW5mb3JjZWQuXG4gICAgICB0aGlzLnJhd1ZhbHVlID0gdGhpcy5hcHBseU1hc2soXG4gICAgICAgIGZhbHNlLFxuICAgICAgICAnLScgKyAodGhpcy5yYXdWYWx1ZSA/IHRoaXMucmF3VmFsdWUgOiAnMCcpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNoYW5nZVRvUG9zaXRpdmUoKTogdm9pZCB7XG4gICAgLy8gQXBwbHkgdGhlIG1hc2sgdG8gZW5zdXJlIHRoZSBtaW4gYW5kIG1heCB2YWx1ZXMgYXJlIGVuZm9yY2VkLlxuICAgIHRoaXMucmF3VmFsdWUgPSB0aGlzLmFwcGx5TWFzayhcbiAgICAgIGZhbHNlLFxuICAgICAgdGhpcy5yYXdWYWx1ZT8ucmVwbGFjZSgnLScsICcnKSA/PyAnJ1xuICAgICk7XG4gIH1cblxuICByZW1vdmVOdW1iZXIoa2V5Q29kZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgeyBkZWNpbWFsLCB0aG91c2FuZHMsIHByZWZpeCwgc3VmZml4LCBpbnB1dE1vZGUgfSA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICBpZiAodGhpcy5pc051bGxhYmxlKCkgJiYgdGhpcy52YWx1ZSA9PSAwKSB7XG4gICAgICB0aGlzLnJhd1ZhbHVlID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgc2VsZWN0aW9uRW5kID0gdGhpcy5pbnB1dFNlbGVjdGlvbi5zZWxlY3Rpb25FbmQ7XG4gICAgbGV0IHNlbGVjdGlvblN0YXJ0ID0gdGhpcy5pbnB1dFNlbGVjdGlvbi5zZWxlY3Rpb25TdGFydDtcblxuICAgIGNvbnN0IHN1ZmZpeFN0YXJ0ID0gKHRoaXMucmF3VmFsdWU/Lmxlbmd0aCA/PyAwKSAtIHN1ZmZpeC5sZW5ndGg7XG4gICAgc2VsZWN0aW9uRW5kID0gTWF0aC5taW4oc3VmZml4U3RhcnQsIE1hdGgubWF4KHNlbGVjdGlvbkVuZCwgcHJlZml4Lmxlbmd0aCkpO1xuICAgIHNlbGVjdGlvblN0YXJ0ID0gTWF0aC5taW4oXG4gICAgICBzdWZmaXhTdGFydCxcbiAgICAgIE1hdGgubWF4KHNlbGVjdGlvblN0YXJ0LCBwcmVmaXgubGVuZ3RoKVxuICAgICk7XG5cbiAgICAvLyBDaGVjayBpZiBzZWxlY3Rpb24gd2FzIGVudGlyZWx5IGluIHRoZSBwcmVmaXggb3Igc3VmZml4LlxuICAgIGlmIChcbiAgICAgIHNlbGVjdGlvblN0YXJ0ID09PSBzZWxlY3Rpb25FbmQgJiZcbiAgICAgIHRoaXMuaW5wdXRTZWxlY3Rpb24uc2VsZWN0aW9uU3RhcnQgIT09IHRoaXMuaW5wdXRTZWxlY3Rpb24uc2VsZWN0aW9uRW5kXG4gICAgKSB7XG4gICAgICB0aGlzLnVwZGF0ZUZpZWxkVmFsdWUoc2VsZWN0aW9uU3RhcnQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBkZWNpbWFsSW5kZXggPSB0aGlzLnJhd1ZhbHVlPy5pbmRleE9mKGRlY2ltYWwpID8/IC0xO1xuICAgIGlmIChkZWNpbWFsSW5kZXggPT09IC0xKSB7XG4gICAgICBkZWNpbWFsSW5kZXggPSB0aGlzLnJhd1ZhbHVlPy5sZW5ndGggPz8gMDtcbiAgICB9XG5cbiAgICBsZXQgc2hpZnRTZWxlY3Rpb24gPSAwO1xuICAgIGxldCBpbnNlcnRDaGFycyA9ICcnO1xuXG4gICAgY29uc3QgaXNDdXJzb3JJbkRlY2ltYWxzID0gZGVjaW1hbEluZGV4IDwgc2VsZWN0aW9uRW5kO1xuICAgIGNvbnN0IGlzQ3Vyc29ySW1tZWRpYXRlbHlBZnRlckRlY2ltYWxQb2ludCA9XG4gICAgICBkZWNpbWFsSW5kZXggKyAxID09PSBzZWxlY3Rpb25FbmQ7XG5cbiAgICBpZiAoc2VsZWN0aW9uRW5kID09PSBzZWxlY3Rpb25TdGFydCkge1xuICAgICAgaWYgKGtleUNvZGUgPT0gOCkge1xuICAgICAgICBpZiAoc2VsZWN0aW9uU3RhcnQgPD0gcHJlZml4Lmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rpb25TdGFydC0tO1xuXG4gICAgICAgIC8vIElmIHByZXZpb3VzIGNoYXIgaXNuJ3QgYSBudW1iZXIsIGdvIGJhY2sgb25lIG1vcmUuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAhdGhpcy5yYXdWYWx1ZVxuICAgICAgICAgICAgPy5zdWJzdHJpbmcoc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvblN0YXJ0ICsgMSlcbiAgICAgICAgICAgIC5tYXRjaCgvXFxkLylcbiAgICAgICAgKSB7XG4gICAgICAgICAgc2VsZWN0aW9uU3RhcnQtLTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluIG5hdHVyYWwgbW9kZSwganVtcCBiYWNrd2FyZHMgd2hlbiBpbiBkZWNpbWFsIHBvcnRpb24gb2YgbnVtYmVyLlxuICAgICAgICBpZiAoaW5wdXRNb2RlID09PSBOZ3hDdXJyZW5jeUlucHV0TW9kZS5OYXR1cmFsICYmIGlzQ3Vyc29ySW5EZWNpbWFscykge1xuICAgICAgICAgIHNoaWZ0U2VsZWN0aW9uID0gLTE7XG4gICAgICAgICAgLy8gd2hlbiByZW1vdmluZyBhIHNpbmdsZSB3aG9sZSBudW1iZXIsIHJlcGxhY2UgaXQgd2l0aCAwXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaXNDdXJzb3JJbW1lZGlhdGVseUFmdGVyRGVjaW1hbFBvaW50ICYmXG4gICAgICAgICAgICAodGhpcy52YWx1ZSA/PyAwKSA8IDEwICYmXG4gICAgICAgICAgICAodGhpcy52YWx1ZSA/PyAwKSA+IC0xMFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgaW5zZXJ0Q2hhcnMgKz0gJzAnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChrZXlDb2RlID09IDQ2IHx8IGtleUNvZGUgPT0gNjMyNzIpIHtcbiAgICAgICAgaWYgKHNlbGVjdGlvblN0YXJ0ID09PSBzdWZmaXhTdGFydCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rpb25FbmQrKztcblxuICAgICAgICAvLyBJZiBuZXh0IGNoYXIgaXNuJ3QgYSBudW1iZXIsIGdvIG9uZSBtb3JlLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgIXRoaXMucmF3VmFsdWVcbiAgICAgICAgICAgID8uc3Vic3RyaW5nKHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25TdGFydCArIDEpXG4gICAgICAgICAgICAubWF0Y2goL1xcZC8pXG4gICAgICAgICkge1xuICAgICAgICAgIHNlbGVjdGlvblN0YXJ0Kys7XG4gICAgICAgICAgc2VsZWN0aW9uRW5kKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbiBuYXR1cmFsIG1vZGUsIHJlcGxhY2UgZGVjaW1hbHMgd2l0aCAwcy5cbiAgICBpZiAoXG4gICAgICBpbnB1dE1vZGUgPT09IE5neEN1cnJlbmN5SW5wdXRNb2RlLk5hdHVyYWwgJiZcbiAgICAgIHNlbGVjdGlvblN0YXJ0ID4gZGVjaW1hbEluZGV4XG4gICAgKSB7XG4gICAgICBjb25zdCByZXBsYWNlZERlY2ltYWxDb3VudCA9IHNlbGVjdGlvbkVuZCAtIHNlbGVjdGlvblN0YXJ0O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXBsYWNlZERlY2ltYWxDb3VudDsgaSsrKSB7XG4gICAgICAgIGluc2VydENoYXJzICs9ICcwJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgc2VsZWN0aW9uRnJvbUVuZCA9ICh0aGlzLnJhd1ZhbHVlPy5sZW5ndGggPz8gMCkgLSBzZWxlY3Rpb25FbmQ7XG4gICAgdGhpcy5yYXdWYWx1ZSA9XG4gICAgICB0aGlzLnJhd1ZhbHVlPy5zdWJzdHJpbmcoMCwgc2VsZWN0aW9uU3RhcnQpICtcbiAgICAgIGluc2VydENoYXJzICtcbiAgICAgIHRoaXMucmF3VmFsdWU/LnN1YnN0cmluZyhzZWxlY3Rpb25FbmQpO1xuXG4gICAgLy8gUmVtb3ZlIGxlYWRpbmcgdGhvdXNhbmQgc2VwYXJhdG9yIGZyb20gcmF3IHZhbHVlLlxuICAgIGNvbnN0IHN0YXJ0Q2hhciA9IHRoaXMucmF3VmFsdWUuc3Vic3RyaW5nKHByZWZpeC5sZW5ndGgsIHByZWZpeC5sZW5ndGggKyAxKTtcbiAgICBpZiAoc3RhcnRDaGFyID09PSB0aG91c2FuZHMpIHtcbiAgICAgIHRoaXMucmF3VmFsdWUgPVxuICAgICAgICB0aGlzLnJhd1ZhbHVlLnN1YnN0cmluZygwLCBwcmVmaXgubGVuZ3RoKSArXG4gICAgICAgIHRoaXMucmF3VmFsdWUuc3Vic3RyaW5nKHByZWZpeC5sZW5ndGggKyAxKTtcbiAgICAgIHNlbGVjdGlvbkZyb21FbmQgPSBNYXRoLm1pbihcbiAgICAgICAgc2VsZWN0aW9uRnJvbUVuZCxcbiAgICAgICAgdGhpcy5yYXdWYWx1ZS5sZW5ndGggLSBwcmVmaXgubGVuZ3RoXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlRmllbGRWYWx1ZShcbiAgICAgIHRoaXMucmF3VmFsdWUubGVuZ3RoIC0gc2VsZWN0aW9uRnJvbUVuZCArIHNoaWZ0U2VsZWN0aW9uLFxuICAgICAgdHJ1ZVxuICAgICk7XG4gIH1cblxuICB1cGRhdGVGaWVsZFZhbHVlKHNlbGVjdGlvblN0YXJ0PzogbnVtYmVyLCBkaXNhYmxlUGFkQW5kVHJpbSA9IGZhbHNlKTogdm9pZCB7XG4gICAgY29uc3QgbmV3UmF3VmFsdWUgPSB0aGlzLmFwcGx5TWFzayhcbiAgICAgIGZhbHNlLFxuICAgICAgdGhpcy5yYXdWYWx1ZSA/PyAnJyxcbiAgICAgIGRpc2FibGVQYWRBbmRUcmltXG4gICAgKTtcbiAgICBzZWxlY3Rpb25TdGFydCA/Pz0gdGhpcy5yYXdWYWx1ZT8ubGVuZ3RoID8/IDA7XG4gICAgc2VsZWN0aW9uU3RhcnQgPSBNYXRoLm1heChcbiAgICAgIHRoaXMuX29wdGlvbnMucHJlZml4Lmxlbmd0aCxcbiAgICAgIE1hdGgubWluKFxuICAgICAgICBzZWxlY3Rpb25TdGFydCxcbiAgICAgICAgKHRoaXMucmF3VmFsdWU/Lmxlbmd0aCA/PyAwKSAtIHRoaXMuX29wdGlvbnMuc3VmZml4Lmxlbmd0aFxuICAgICAgKVxuICAgICk7XG4gICAgdGhpcy5pbnB1dE1hbmFnZXIudXBkYXRlVmFsdWVBbmRDdXJzb3IoXG4gICAgICBuZXdSYXdWYWx1ZSxcbiAgICAgIHRoaXMucmF3VmFsdWU/Lmxlbmd0aCA/PyAwLFxuICAgICAgc2VsZWN0aW9uU3RhcnRcbiAgICApO1xuICB9XG5cbiAgdXBkYXRlT3B0aW9ucyhvcHRpb25zOiBOZ3hDdXJyZW5jeUNvbmZpZyk6IHZvaWQge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwcmVmaXhMZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy5wcmVmaXgubGVuZ3RoO1xuICB9XG5cbiAgc3VmZml4TGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnMuc3VmZml4Lmxlbmd0aDtcbiAgfVxuXG4gIGlzTnVsbGFibGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnMubnVsbGFibGU7XG4gIH1cblxuICBnZXQgY2FuSW5wdXRNb3JlTnVtYmVycygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dE1hbmFnZXIuY2FuSW5wdXRNb3JlTnVtYmVycztcbiAgfVxuXG4gIGdldCBpbnB1dFNlbGVjdGlvbigpOiB7XG4gICAgc2VsZWN0aW9uU3RhcnQ6IG51bWJlcjtcbiAgICBzZWxlY3Rpb25FbmQ6IG51bWJlcjtcbiAgfSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXRNYW5hZ2VyLmlucHV0U2VsZWN0aW9uO1xuICB9XG5cbiAgZ2V0IHJhd1ZhbHVlKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmlucHV0TWFuYWdlci5yYXdWYWx1ZTtcbiAgfVxuXG4gIHNldCByYXdWYWx1ZSh2YWx1ZTogc3RyaW5nIHwgbnVsbCkge1xuICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnJhd1ZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBnZXQgc3RvcmVkUmF3VmFsdWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dE1hbmFnZXIuc3RvcmVkUmF3VmFsdWU7XG4gIH1cblxuICBnZXQgdmFsdWUoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY2xlYXJNYXNrKHRoaXMucmF3VmFsdWUpO1xuICB9XG5cbiAgc2V0IHZhbHVlKHZhbHVlOiBudW1iZXIgfCBudWxsKSB7XG4gICAgdGhpcy5yYXdWYWx1ZSA9IHRoaXMuYXBwbHlNYXNrKHRydWUsICcnICsgdmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaXNOdWxsT3JVbmRlZmluZWQodmFsdWU6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbiAgfVxufVxuIl19