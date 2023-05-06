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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jdXJyZW5jeS9zcmMvbGliL2lucHV0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBcUIsb0JBQW9CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVoRixNQUFNLE9BQU8sWUFBWTtJQWtDdkIsWUFDRSxnQkFBa0MsRUFDMUIsUUFBMkI7UUFBM0IsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7UUFuQ3BCLHNCQUFpQixHQUFHLElBQUksTUFBTSxDQUM3QyxtQ0FBbUMsQ0FDcEMsQ0FBQztRQUNlLHNCQUFpQixHQUFHLElBQUksTUFBTSxDQUM3QyxtQ0FBbUMsQ0FDcEMsQ0FBQztRQUVlLGlCQUFZLEdBQUcsSUFBSSxHQUFHLENBQWlCO1lBQ3RELENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUVmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUNmLENBQUMsUUFBUSxFQUFFLEdBQUcs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S0FBZ0M7UUFDekQsT0FBTyxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxTQUFTLENBQUM7SUFDL0MsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5wdXRNYW5hZ2VyIH0gZnJvbSAnLi9pbnB1dC5tYW5hZ2VyJztcbmltcG9ydCB7IE5neEN1cnJlbmN5Q29uZmlnLCBOZ3hDdXJyZW5jeUlucHV0TW9kZSB9IGZyb20gJy4vbmd4LWN1cnJlbmN5LmNvbmZpZyc7XG5cbmV4cG9ydCBjbGFzcyBJbnB1dFNlcnZpY2Uge1xuICBwcml2YXRlIHJlYWRvbmx5IF9zaW5nbGVEaWdpdFJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICAvXlswLTlcXHUwNjYwLVxcdTA2NjlcXHUwNkYwLVxcdTA2RjldJC9cbiAgKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfb25seU51bWJlcnNSZWdleCA9IG5ldyBSZWdFeHAoXG4gICAgL1teMC05XFx1MDY2MC1cXHUwNjY5XFx1MDZGMC1cXHUwNkY5XS9nXG4gICk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfcGVyQXJOdW1iZXIgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPihbXG4gICAgWydcXHUwNkYwJywgJzAnXSxcbiAgICBbJ1xcdTA2RjEnLCAnMSddLFxuICAgIFsnXFx1MDZGMicsICcyJ10sXG4gICAgWydcXHUwNkYzJywgJzMnXSxcbiAgICBbJ1xcdTA2RjQnLCAnNCddLFxuICAgIFsnXFx1MDZGNScsICc1J10sXG4gICAgWydcXHUwNkY2JywgJzYnXSxcbiAgICBbJ1xcdTA2RjcnLCAnNyddLFxuICAgIFsnXFx1MDZGOCcsICc4J10sXG4gICAgWydcXHUwNkY5JywgJzknXSxcblxuICAgIFsnXFx1MDY2MCcsICcwJ10sXG4gICAgWydcXHUwNjYxJywgJzEnXSxcbiAgICBbJ1xcdTA2NjInLCAnMiddLFxuICAgIFsnXFx1MDY2MycsICczJ10sXG4gICAgWydcXHUwNjY0JywgJzQnXSxcbiAgICBbJ1xcdTA2NjUnLCAnNSddLFxuICAgIFsnXFx1MDY2NicsICc2J10sXG4gICAgWydcXHUwNjY3JywgJzcnXSxcbiAgICBbJ1xcdTA2NjgnLCAnOCddLFxuICAgIFsnXFx1MDY2OScsICc5J10sXG4gIF0pO1xuXG4gIGlucHV0TWFuYWdlcjogSW5wdXRNYW5hZ2VyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGh0bWxJbnB1dEVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQsXG4gICAgcHJpdmF0ZSBfb3B0aW9uczogTmd4Q3VycmVuY3lDb25maWdcbiAgKSB7XG4gICAgdGhpcy5pbnB1dE1hbmFnZXIgPSBuZXcgSW5wdXRNYW5hZ2VyKGh0bWxJbnB1dEVsZW1lbnQpO1xuICB9XG5cbiAgYWRkTnVtYmVyKGtleUNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHsgZGVjaW1hbCwgcHJlY2lzaW9uLCBpbnB1dE1vZGUgfSA9IHRoaXMuX29wdGlvbnM7XG4gICAgY29uc3Qga2V5Q2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Q29kZSk7XG4gICAgY29uc3QgaXNEZWNpbWFsQ2hhciA9IGtleUNoYXIgPT09IHRoaXMuX29wdGlvbnMuZGVjaW1hbDtcblxuICAgIGlmICghdGhpcy5yYXdWYWx1ZSkge1xuICAgICAgdGhpcy5yYXdWYWx1ZSA9IHRoaXMuYXBwbHlNYXNrKGZhbHNlLCBrZXlDaGFyKTtcbiAgICAgIGxldCBzZWxlY3Rpb25TdGFydDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgaWYgKGlucHV0TW9kZSA9PT0gTmd4Q3VycmVuY3lJbnB1dE1vZGUuTmF0dXJhbCAmJiBwcmVjaXNpb24gPiAwKSB7XG4gICAgICAgIHNlbGVjdGlvblN0YXJ0ID0gdGhpcy5yYXdWYWx1ZS5pbmRleE9mKGRlY2ltYWwpO1xuICAgICAgICBpZiAoaXNEZWNpbWFsQ2hhcikge1xuICAgICAgICAgIHNlbGVjdGlvblN0YXJ0Kys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMudXBkYXRlRmllbGRWYWx1ZShzZWxlY3Rpb25TdGFydCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNlbGVjdGlvblN0YXJ0ID0gdGhpcy5pbnB1dFNlbGVjdGlvbi5zZWxlY3Rpb25TdGFydDtcbiAgICAgIGNvbnN0IHNlbGVjdGlvbkVuZCA9IHRoaXMuaW5wdXRTZWxlY3Rpb24uc2VsZWN0aW9uRW5kO1xuICAgICAgY29uc3QgcmF3VmFsdWVTdGFydCA9IHRoaXMucmF3VmFsdWUuc3Vic3RyaW5nKDAsIHNlbGVjdGlvblN0YXJ0KTtcbiAgICAgIGxldCByYXdWYWx1ZUVuZCA9IHRoaXMucmF3VmFsdWUuc3Vic3RyaW5nKFxuICAgICAgICBzZWxlY3Rpb25FbmQsXG4gICAgICAgIHRoaXMucmF3VmFsdWUubGVuZ3RoXG4gICAgICApO1xuXG4gICAgICAvLyBJbiBuYXR1cmFsIG1vZGUsIHJlcGxhY2UgZGVjaW1hbHMgaW5zdGVhZCBvZiBzaGlmdGluZyB0aGVtLlxuICAgICAgY29uc3QgaW5EZWNpbWFsUG9ydGlvbiA9IHJhd1ZhbHVlU3RhcnQuaW5kZXhPZihkZWNpbWFsKSAhPT0gLTE7XG4gICAgICBpZiAoXG4gICAgICAgIGlucHV0TW9kZSA9PT0gTmd4Q3VycmVuY3lJbnB1dE1vZGUuTmF0dXJhbCAmJlxuICAgICAgICBpbkRlY2ltYWxQb3J0aW9uICYmXG4gICAgICAgIHNlbGVjdGlvblN0YXJ0ID09PSBzZWxlY3Rpb25FbmRcbiAgICAgICkge1xuICAgICAgICByYXdWYWx1ZUVuZCA9IHJhd1ZhbHVlRW5kLnN1YnN0cmluZygxKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV3VmFsdWUgPSByYXdWYWx1ZVN0YXJ0ICsga2V5Q2hhciArIHJhd1ZhbHVlRW5kO1xuICAgICAgbGV0IG5leHRTZWxlY3Rpb25TdGFydCA9IHNlbGVjdGlvblN0YXJ0ICsgMTtcbiAgICAgIGNvbnN0IGlzRGVjaW1hbE9yVGhvdXNhbmRzID1cbiAgICAgICAgaXNEZWNpbWFsQ2hhciB8fCBrZXlDaGFyID09PSB0aGlzLl9vcHRpb25zLnRob3VzYW5kcztcbiAgICAgIGlmIChpc0RlY2ltYWxPclRob3VzYW5kcyAmJiBrZXlDaGFyID09PSByYXdWYWx1ZUVuZFswXSkge1xuICAgICAgICAvLyBJZiB0aGUgY3Vyc29yIGlzIGp1c3QgYmVmb3JlIHRoZSBkZWNpbWFsIG9yIHRob3VzYW5kcyBzZXBhcmF0b3IgYW5kIHRoZSB1c2VyIHR5cGVzIHRoZVxuICAgICAgICAvLyBkZWNpbWFsIG9yIHRob3VzYW5kcyBzZXBhcmF0b3IsIG1vdmUgdGhlIGN1cnNvciBwYXN0IGl0LlxuICAgICAgICBuZXh0U2VsZWN0aW9uU3RhcnQrKztcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX3NpbmdsZURpZ2l0UmVnZXgudGVzdChrZXlDaGFyKSkge1xuICAgICAgICAvLyBJZ25vcmUgb3RoZXIgbm9uLW51bWJlcnMuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yYXdWYWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy51cGRhdGVGaWVsZFZhbHVlKG5leHRTZWxlY3Rpb25TdGFydCk7XG4gICAgfVxuICB9XG5cbiAgYXBwbHlNYXNrKFxuICAgIGlzTnVtYmVyOiBib29sZWFuLFxuICAgIHJhd1ZhbHVlOiBzdHJpbmcsXG4gICAgZGlzYWJsZVBhZEFuZFRyaW0gPSBmYWxzZVxuICApOiBzdHJpbmcge1xuICAgIGNvbnN0IHtcbiAgICAgIGFsbG93TmVnYXRpdmUsXG4gICAgICBkZWNpbWFsLFxuICAgICAgcHJlY2lzaW9uLFxuICAgICAgcHJlZml4LFxuICAgICAgc3VmZml4LFxuICAgICAgdGhvdXNhbmRzLFxuICAgICAgbWluLFxuICAgICAgaW5wdXRNb2RlLFxuICAgIH0gPSB0aGlzLl9vcHRpb25zO1xuXG4gICAgbGV0IHsgbWF4IH0gPSB0aGlzLl9vcHRpb25zO1xuXG4gICAgcmF3VmFsdWUgPSBpc051bWJlciA/IG5ldyBOdW1iZXIocmF3VmFsdWUpLnRvRml4ZWQocHJlY2lzaW9uKSA6IHJhd1ZhbHVlO1xuICAgIGxldCBvbmx5TnVtYmVycyA9IHJhd1ZhbHVlLnJlcGxhY2UodGhpcy5fb25seU51bWJlcnNSZWdleCwgJycpO1xuXG4gICAgaWYgKCFvbmx5TnVtYmVycyAmJiByYXdWYWx1ZSAhPT0gZGVjaW1hbCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIGlucHV0TW9kZSA9PT0gTmd4Q3VycmVuY3lJbnB1dE1vZGUuTmF0dXJhbCAmJlxuICAgICAgIWlzTnVtYmVyICYmXG4gICAgICAhZGlzYWJsZVBhZEFuZFRyaW1cbiAgICApIHtcbiAgICAgIHJhd1ZhbHVlID0gdGhpcy5wYWRPclRyaW1QcmVjaXNpb24ocmF3VmFsdWUpO1xuICAgICAgb25seU51bWJlcnMgPSByYXdWYWx1ZS5yZXBsYWNlKHRoaXMuX29ubHlOdW1iZXJzUmVnZXgsICcnKTtcbiAgICB9XG5cbiAgICBsZXQgaW50ZWdlclBhcnQgPSBvbmx5TnVtYmVyc1xuICAgICAgLnNsaWNlKDAsIG9ubHlOdW1iZXJzLmxlbmd0aCAtIHByZWNpc2lvbilcbiAgICAgIC5yZXBsYWNlKC9eXFx1MDY2MCovZywgJycpXG4gICAgICAucmVwbGFjZSgvXlxcdTA2RjAqL2csICcnKVxuICAgICAgLnJlcGxhY2UoL14wKi9nLCAnJyk7XG5cbiAgICBpZiAoaW50ZWdlclBhcnQgPT0gJycpIHtcbiAgICAgIGludGVnZXJQYXJ0ID0gJzAnO1xuICAgIH1cbiAgICBjb25zdCBpbnRlZ2VyVmFsdWUgPSBwYXJzZUludChpbnRlZ2VyUGFydCk7XG5cbiAgICBpbnRlZ2VyUGFydCA9IGludGVnZXJQYXJ0LnJlcGxhY2UoXG4gICAgICAvXFxCKD89KFswLTlcXHUwNjYwLVxcdTA2NjlcXHUwNkYwLVxcdTA2RjldezN9KSsoPyFbMC05XFx1MDY2MC1cXHUwNjY5XFx1MDZGMC1cXHUwNkY5XSkpL2csXG4gICAgICB0aG91c2FuZHNcbiAgICApO1xuICAgIGlmICh0aG91c2FuZHMgJiYgaW50ZWdlclBhcnQuc3RhcnRzV2l0aCh0aG91c2FuZHMpKSB7XG4gICAgICBpbnRlZ2VyUGFydCA9IGludGVnZXJQYXJ0LnN1YnN0cmluZygxKTtcbiAgICB9XG5cbiAgICBsZXQgbmV3UmF3VmFsdWUgPSBpbnRlZ2VyUGFydDtcbiAgICBjb25zdCBkZWNpbWFsUGFydCA9IG9ubHlOdW1iZXJzLnNsaWNlKG9ubHlOdW1iZXJzLmxlbmd0aCAtIHByZWNpc2lvbik7XG4gICAgY29uc3QgZGVjaW1hbFZhbHVlID0gcGFyc2VJbnQoZGVjaW1hbFBhcnQpIHx8IDA7XG5cbiAgICBjb25zdCBpc05lZ2F0aXZlID0gcmF3VmFsdWUuaW5kZXhPZignLScpID4gLTE7XG5cbiAgICAvLyBFbnN1cmUgbWF4IGlzIGF0IGxlYXN0IGFzIGxhcmdlIGFzIG1pbi5cbiAgICBtYXggPVxuICAgICAgbWF4ID09PSBudWxsIHx8IG1heCA9PT0gdW5kZWZpbmVkIHx8IG1pbiA9PT0gbnVsbCB8fCBtaW4gPT09IHVuZGVmaW5lZFxuICAgICAgICA/IG1heFxuICAgICAgICA6IE1hdGgubWF4KG1heCwgbWluKTtcblxuICAgIC8vIEVuc3VyZSBwcmVjaXNpb24gbnVtYmVyIHdvcmtzIHdlbGwgd2l0aCBtb3JlIHRoYW4gMiBkaWdpdHNcbiAgICAvLyAyMyAvIDEwMC4uLiAyMzMgLyAxMDAwIGFuZCBzbyBvblxuICAgIGNvbnN0IGRpdmlkZUJ5ID0gTnVtYmVyKCcxJy5wYWRFbmQocHJlY2lzaW9uICsgMSwgJzAnKSk7XG5cbiAgICAvLyBSZXN0cmljdCB0byB0aGUgbWluIGFuZCBtYXggdmFsdWVzLlxuICAgIGxldCBuZXdWYWx1ZSA9IGludGVnZXJWYWx1ZSArIGRlY2ltYWxWYWx1ZSAvIGRpdmlkZUJ5O1xuXG4gICAgbmV3VmFsdWUgPSBpc05lZ2F0aXZlID8gLW5ld1ZhbHVlIDogbmV3VmFsdWU7XG4gICAgaWYgKG1heCAhPT0gbnVsbCAmJiBtYXggIT09IHVuZGVmaW5lZCAmJiBuZXdWYWx1ZSA+IG1heCkge1xuICAgICAgcmV0dXJuIHRoaXMuYXBwbHlNYXNrKHRydWUsIG1heCArICcnKTtcbiAgICB9IGVsc2UgaWYgKG1pbiAhPT0gbnVsbCAmJiBtaW4gIT09IHVuZGVmaW5lZCAmJiBuZXdWYWx1ZSA8IG1pbikge1xuICAgICAgcmV0dXJuIHRoaXMuYXBwbHlNYXNrKHRydWUsIG1pbiArICcnKTtcbiAgICB9XG5cbiAgICBpZiAocHJlY2lzaW9uID4gMCkge1xuICAgICAgaWYgKG5ld1Jhd1ZhbHVlID09ICcwJyAmJiBkZWNpbWFsUGFydC5sZW5ndGggPCBwcmVjaXNpb24pIHtcbiAgICAgICAgbmV3UmF3VmFsdWUgKz0gZGVjaW1hbCArICcwJy5yZXBlYXQocHJlY2lzaW9uIC0gMSkgKyBkZWNpbWFsUGFydDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Jhd1ZhbHVlICs9IGRlY2ltYWwgKyBkZWNpbWFsUGFydDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBsZXQgaXNaZXJvID0gbmV3VmFsdWUgPT0gMDtcbiAgICBjb25zdCBvcGVyYXRvciA9IGlzTmVnYXRpdmUgJiYgYWxsb3dOZWdhdGl2ZSAvKiYmICFpc1plcm8gKi8gPyAnLScgOiAnJztcbiAgICByZXR1cm4gb3BlcmF0b3IgKyBwcmVmaXggKyBuZXdSYXdWYWx1ZSArIHN1ZmZpeDtcbiAgfVxuXG4gIHBhZE9yVHJpbVByZWNpc2lvbihyYXdWYWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCB7IGRlY2ltYWwsIHByZWNpc2lvbiB9ID0gdGhpcy5fb3B0aW9ucztcblxuICAgIGxldCBkZWNpbWFsSW5kZXggPSByYXdWYWx1ZS5sYXN0SW5kZXhPZihkZWNpbWFsKTtcbiAgICBpZiAoZGVjaW1hbEluZGV4ID09PSAtMSkge1xuICAgICAgZGVjaW1hbEluZGV4ID0gcmF3VmFsdWUubGVuZ3RoO1xuICAgICAgcmF3VmFsdWUgKz0gZGVjaW1hbDtcbiAgICB9XG5cbiAgICBsZXQgZGVjaW1hbFBvcnRpb24gPSByYXdWYWx1ZVxuICAgICAgLnN1YnN0cmluZyhkZWNpbWFsSW5kZXgpXG4gICAgICAucmVwbGFjZSh0aGlzLl9vbmx5TnVtYmVyc1JlZ2V4LCAnJyk7XG4gICAgY29uc3QgYWN0dWFsUHJlY2lzaW9uID0gZGVjaW1hbFBvcnRpb24ubGVuZ3RoO1xuICAgIGlmIChhY3R1YWxQcmVjaXNpb24gPCBwcmVjaXNpb24pIHtcbiAgICAgIGZvciAobGV0IGkgPSBhY3R1YWxQcmVjaXNpb247IGkgPCBwcmVjaXNpb247IGkrKykge1xuICAgICAgICBkZWNpbWFsUG9ydGlvbiArPSAnMCc7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChhY3R1YWxQcmVjaXNpb24gPiBwcmVjaXNpb24pIHtcbiAgICAgIGRlY2ltYWxQb3J0aW9uID0gZGVjaW1hbFBvcnRpb24uc3Vic3RyaW5nKFxuICAgICAgICAwLFxuICAgICAgICBkZWNpbWFsUG9ydGlvbi5sZW5ndGggKyBwcmVjaXNpb24gLSBhY3R1YWxQcmVjaXNpb25cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhd1ZhbHVlLnN1YnN0cmluZygwLCBkZWNpbWFsSW5kZXgpICsgZGVjaW1hbCArIGRlY2ltYWxQb3J0aW9uO1xuICB9XG5cbiAgY2xlYXJNYXNrKHJhd1ZhbHVlOiBzdHJpbmcgfCBudWxsKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgaWYgKHRoaXMuaXNOdWxsYWJsZSgpICYmIHJhd1ZhbHVlID09PSAnJykgcmV0dXJuIG51bGw7XG5cbiAgICBsZXQgdmFsdWUgPSAocmF3VmFsdWUgfHwgJzAnKVxuICAgICAgLnJlcGxhY2UodGhpcy5fb3B0aW9ucy5wcmVmaXgsICcnKVxuICAgICAgLnJlcGxhY2UodGhpcy5fb3B0aW9ucy5zdWZmaXgsICcnKTtcblxuICAgIGlmICh0aGlzLl9vcHRpb25zLnRob3VzYW5kcykge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKFxuICAgICAgICBuZXcgUmVnRXhwKCdcXFxcJyArIHRoaXMuX29wdGlvbnMudGhvdXNhbmRzLCAnZycpLFxuICAgICAgICAnJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5kZWNpbWFsKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UodGhpcy5fb3B0aW9ucy5kZWNpbWFsLCAnLicpO1xuICAgIH1cblxuICAgIHRoaXMuX3BlckFyTnVtYmVyLmZvckVhY2goKHZhbDogc3RyaW5nLCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGtleSwgJ2cnKTtcbiAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZShyZSwgdmFsKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gIH1cblxuICBjaGFuZ2VUb05lZ2F0aXZlKCk6IHZvaWQge1xuICAgIGlmIChcbiAgICAgIHRoaXMuX29wdGlvbnMuYWxsb3dOZWdhdGl2ZSAvKiYmIHRoaXMucmF3VmFsdWUgIT0gXCJcIiovICYmXG4gICAgICB0aGlzLnJhd1ZhbHVlPy5jaGFyQXQoMCkgIT0gJy0nIC8qJiYgdGhpcy52YWx1ZSAhPSAwKi9cbiAgICApIHtcbiAgICAgIC8vIEFwcGx5IHRoZSBtYXNrIHRvIGVuc3VyZSB0aGUgbWluIGFuZCBtYXggdmFsdWVzIGFyZSBlbmZvcmNlZC5cbiAgICAgIHRoaXMucmF3VmFsdWUgPSB0aGlzLmFwcGx5TWFzayhcbiAgICAgICAgZmFsc2UsXG4gICAgICAgICctJyArICh0aGlzLnJhd1ZhbHVlID8gdGhpcy5yYXdWYWx1ZSA6ICcwJylcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY2hhbmdlVG9Qb3NpdGl2ZSgpOiB2b2lkIHtcbiAgICAvLyBBcHBseSB0aGUgbWFzayB0byBlbnN1cmUgdGhlIG1pbiBhbmQgbWF4IHZhbHVlcyBhcmUgZW5mb3JjZWQuXG4gICAgdGhpcy5yYXdWYWx1ZSA9IHRoaXMuYXBwbHlNYXNrKFxuICAgICAgZmFsc2UsXG4gICAgICB0aGlzLnJhd1ZhbHVlPy5yZXBsYWNlKCctJywgJycpID8/ICcnXG4gICAgKTtcbiAgfVxuXG4gIHJlbW92ZU51bWJlcihrZXlDb2RlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB7IGRlY2ltYWwsIHRob3VzYW5kcywgcHJlZml4LCBzdWZmaXgsIGlucHV0TW9kZSB9ID0gdGhpcy5fb3B0aW9ucztcblxuICAgIGlmICh0aGlzLmlzTnVsbGFibGUoKSAmJiB0aGlzLnZhbHVlID09IDApIHtcbiAgICAgIHRoaXMucmF3VmFsdWUgPSBudWxsO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBzZWxlY3Rpb25FbmQgPSB0aGlzLmlucHV0U2VsZWN0aW9uLnNlbGVjdGlvbkVuZDtcbiAgICBsZXQgc2VsZWN0aW9uU3RhcnQgPSB0aGlzLmlucHV0U2VsZWN0aW9uLnNlbGVjdGlvblN0YXJ0O1xuXG4gICAgY29uc3Qgc3VmZml4U3RhcnQgPSAodGhpcy5yYXdWYWx1ZT8ubGVuZ3RoID8/IDApIC0gc3VmZml4Lmxlbmd0aDtcbiAgICBzZWxlY3Rpb25FbmQgPSBNYXRoLm1pbihzdWZmaXhTdGFydCwgTWF0aC5tYXgoc2VsZWN0aW9uRW5kLCBwcmVmaXgubGVuZ3RoKSk7XG4gICAgc2VsZWN0aW9uU3RhcnQgPSBNYXRoLm1pbihcbiAgICAgIHN1ZmZpeFN0YXJ0LFxuICAgICAgTWF0aC5tYXgoc2VsZWN0aW9uU3RhcnQsIHByZWZpeC5sZW5ndGgpXG4gICAgKTtcblxuICAgIC8vIENoZWNrIGlmIHNlbGVjdGlvbiB3YXMgZW50aXJlbHkgaW4gdGhlIHByZWZpeCBvciBzdWZmaXguXG4gICAgaWYgKFxuICAgICAgc2VsZWN0aW9uU3RhcnQgPT09IHNlbGVjdGlvbkVuZCAmJlxuICAgICAgdGhpcy5pbnB1dFNlbGVjdGlvbi5zZWxlY3Rpb25TdGFydCAhPT0gdGhpcy5pbnB1dFNlbGVjdGlvbi5zZWxlY3Rpb25FbmRcbiAgICApIHtcbiAgICAgIHRoaXMudXBkYXRlRmllbGRWYWx1ZShzZWxlY3Rpb25TdGFydCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGRlY2ltYWxJbmRleCA9IHRoaXMucmF3VmFsdWU/LmluZGV4T2YoZGVjaW1hbCkgPz8gLTE7XG4gICAgaWYgKGRlY2ltYWxJbmRleCA9PT0gLTEpIHtcbiAgICAgIGRlY2ltYWxJbmRleCA9IHRoaXMucmF3VmFsdWU/Lmxlbmd0aCA/PyAwO1xuICAgIH1cblxuICAgIGxldCBzaGlmdFNlbGVjdGlvbiA9IDA7XG4gICAgbGV0IGluc2VydENoYXJzID0gJyc7XG5cbiAgICBjb25zdCBpc0N1cnNvckluRGVjaW1hbHMgPSBkZWNpbWFsSW5kZXggPCBzZWxlY3Rpb25FbmQ7XG4gICAgY29uc3QgaXNDdXJzb3JJbW1lZGlhdGVseUFmdGVyRGVjaW1hbFBvaW50ID1cbiAgICAgIGRlY2ltYWxJbmRleCArIDEgPT09IHNlbGVjdGlvbkVuZDtcblxuICAgIGlmIChzZWxlY3Rpb25FbmQgPT09IHNlbGVjdGlvblN0YXJ0KSB7XG4gICAgICBpZiAoa2V5Q29kZSA9PSA4KSB7XG4gICAgICAgIGlmIChzZWxlY3Rpb25TdGFydCA8PSBwcmVmaXgubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdGlvblN0YXJ0LS07XG5cbiAgICAgICAgLy8gSWYgcHJldmlvdXMgY2hhciBpc24ndCBhIG51bWJlciwgZ28gYmFjayBvbmUgbW9yZS5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICF0aGlzLnJhd1ZhbHVlXG4gICAgICAgICAgICA/LnN1YnN0cmluZyhzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uU3RhcnQgKyAxKVxuICAgICAgICAgICAgLm1hdGNoKC9cXGQvKVxuICAgICAgICApIHtcbiAgICAgICAgICBzZWxlY3Rpb25TdGFydC0tO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW4gbmF0dXJhbCBtb2RlLCBqdW1wIGJhY2t3YXJkcyB3aGVuIGluIGRlY2ltYWwgcG9ydGlvbiBvZiBudW1iZXIuXG4gICAgICAgIGlmIChpbnB1dE1vZGUgPT09IE5neEN1cnJlbmN5SW5wdXRNb2RlLk5hdHVyYWwgJiYgaXNDdXJzb3JJbkRlY2ltYWxzKSB7XG4gICAgICAgICAgc2hpZnRTZWxlY3Rpb24gPSAtMTtcbiAgICAgICAgICAvLyB3aGVuIHJlbW92aW5nIGEgc2luZ2xlIHdob2xlIG51bWJlciwgcmVwbGFjZSBpdCB3aXRoIDBcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpc0N1cnNvckltbWVkaWF0ZWx5QWZ0ZXJEZWNpbWFsUG9pbnQgJiZcbiAgICAgICAgICAgICh0aGlzLnZhbHVlID8/IDApIDwgMTAgJiZcbiAgICAgICAgICAgICh0aGlzLnZhbHVlID8/IDApID4gLTEwXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBpbnNlcnRDaGFycyArPSAnMCc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT0gNDYgfHwga2V5Q29kZSA9PSA2MzI3Mikge1xuICAgICAgICBpZiAoc2VsZWN0aW9uU3RhcnQgPT09IHN1ZmZpeFN0YXJ0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdGlvbkVuZCsrO1xuXG4gICAgICAgIC8vIElmIG5leHQgY2hhciBpc24ndCBhIG51bWJlciwgZ28gb25lIG1vcmUuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAhdGhpcy5yYXdWYWx1ZVxuICAgICAgICAgICAgPy5zdWJzdHJpbmcoc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvblN0YXJ0ICsgMSlcbiAgICAgICAgICAgIC5tYXRjaCgvXFxkLylcbiAgICAgICAgKSB7XG4gICAgICAgICAgc2VsZWN0aW9uU3RhcnQrKztcbiAgICAgICAgICBzZWxlY3Rpb25FbmQrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEluIG5hdHVyYWwgbW9kZSwgcmVwbGFjZSBkZWNpbWFscyB3aXRoIDBzLlxuICAgIGlmIChcbiAgICAgIGlucHV0TW9kZSA9PT0gTmd4Q3VycmVuY3lJbnB1dE1vZGUuTmF0dXJhbCAmJlxuICAgICAgc2VsZWN0aW9uU3RhcnQgPiBkZWNpbWFsSW5kZXhcbiAgICApIHtcbiAgICAgIGNvbnN0IHJlcGxhY2VkRGVjaW1hbENvdW50ID0gc2VsZWN0aW9uRW5kIC0gc2VsZWN0aW9uU3RhcnQ7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlcGxhY2VkRGVjaW1hbENvdW50OyBpKyspIHtcbiAgICAgICAgaW5zZXJ0Q2hhcnMgKz0gJzAnO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBzZWxlY3Rpb25Gcm9tRW5kID0gKHRoaXMucmF3VmFsdWU/Lmxlbmd0aCA/PyAwKSAtIHNlbGVjdGlvbkVuZDtcbiAgICB0aGlzLnJhd1ZhbHVlID1cbiAgICAgIHRoaXMucmF3VmFsdWU/LnN1YnN0cmluZygwLCBzZWxlY3Rpb25TdGFydCkgK1xuICAgICAgaW5zZXJ0Q2hhcnMgK1xuICAgICAgdGhpcy5yYXdWYWx1ZT8uc3Vic3RyaW5nKHNlbGVjdGlvbkVuZCk7XG5cbiAgICAvLyBSZW1vdmUgbGVhZGluZyB0aG91c2FuZCBzZXBhcmF0b3IgZnJvbSByYXcgdmFsdWUuXG4gICAgY29uc3Qgc3RhcnRDaGFyID0gdGhpcy5yYXdWYWx1ZS5zdWJzdHJpbmcocHJlZml4Lmxlbmd0aCwgcHJlZml4Lmxlbmd0aCArIDEpO1xuICAgIGlmIChzdGFydENoYXIgPT09IHRob3VzYW5kcykge1xuICAgICAgdGhpcy5yYXdWYWx1ZSA9XG4gICAgICAgIHRoaXMucmF3VmFsdWUuc3Vic3RyaW5nKDAsIHByZWZpeC5sZW5ndGgpICtcbiAgICAgICAgdGhpcy5yYXdWYWx1ZS5zdWJzdHJpbmcocHJlZml4Lmxlbmd0aCArIDEpO1xuICAgICAgc2VsZWN0aW9uRnJvbUVuZCA9IE1hdGgubWluKFxuICAgICAgICBzZWxlY3Rpb25Gcm9tRW5kLFxuICAgICAgICB0aGlzLnJhd1ZhbHVlLmxlbmd0aCAtIHByZWZpeC5sZW5ndGhcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVGaWVsZFZhbHVlKFxuICAgICAgdGhpcy5yYXdWYWx1ZS5sZW5ndGggLSBzZWxlY3Rpb25Gcm9tRW5kICsgc2hpZnRTZWxlY3Rpb24sXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIHVwZGF0ZUZpZWxkVmFsdWUoc2VsZWN0aW9uU3RhcnQ/OiBudW1iZXIsIGRpc2FibGVQYWRBbmRUcmltID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBuZXdSYXdWYWx1ZSA9IHRoaXMuYXBwbHlNYXNrKFxuICAgICAgZmFsc2UsXG4gICAgICB0aGlzLnJhd1ZhbHVlID8/ICcnLFxuICAgICAgZGlzYWJsZVBhZEFuZFRyaW1cbiAgICApO1xuICAgIHNlbGVjdGlvblN0YXJ0ID8/PSB0aGlzLnJhd1ZhbHVlPy5sZW5ndGggPz8gMDtcbiAgICBzZWxlY3Rpb25TdGFydCA9IE1hdGgubWF4KFxuICAgICAgdGhpcy5fb3B0aW9ucy5wcmVmaXgubGVuZ3RoLFxuICAgICAgTWF0aC5taW4oXG4gICAgICAgIHNlbGVjdGlvblN0YXJ0LFxuICAgICAgICAodGhpcy5yYXdWYWx1ZT8ubGVuZ3RoID8/IDApIC0gdGhpcy5fb3B0aW9ucy5zdWZmaXgubGVuZ3RoXG4gICAgICApXG4gICAgKTtcbiAgICB0aGlzLmlucHV0TWFuYWdlci51cGRhdGVWYWx1ZUFuZEN1cnNvcihcbiAgICAgIG5ld1Jhd1ZhbHVlLFxuICAgICAgdGhpcy5yYXdWYWx1ZT8ubGVuZ3RoID8/IDAsXG4gICAgICBzZWxlY3Rpb25TdGFydFxuICAgICk7XG4gIH1cblxuICB1cGRhdGVPcHRpb25zKG9wdGlvbnM6IE5neEN1cnJlbmN5Q29uZmlnKTogdm9pZCB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHByZWZpeExlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLnByZWZpeC5sZW5ndGg7XG4gIH1cblxuICBzdWZmaXhMZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy5zdWZmaXgubGVuZ3RoO1xuICB9XG5cbiAgaXNOdWxsYWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy5udWxsYWJsZTtcbiAgfVxuXG4gIGdldCBjYW5JbnB1dE1vcmVOdW1iZXJzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlucHV0TWFuYWdlci5jYW5JbnB1dE1vcmVOdW1iZXJzO1xuICB9XG5cbiAgZ2V0IGlucHV0U2VsZWN0aW9uKCk6IHtcbiAgICBzZWxlY3Rpb25TdGFydDogbnVtYmVyO1xuICAgIHNlbGVjdGlvbkVuZDogbnVtYmVyO1xuICB9IHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dE1hbmFnZXIuaW5wdXRTZWxlY3Rpb247XG4gIH1cblxuICBnZXQgcmF3VmFsdWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXRNYW5hZ2VyLnJhd1ZhbHVlO1xuICB9XG5cbiAgc2V0IHJhd1ZhbHVlKHZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgdGhpcy5pbnB1dE1hbmFnZXIucmF3VmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGdldCBzdG9yZWRSYXdWYWx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmlucHV0TWFuYWdlci5zdG9yZWRSYXdWYWx1ZTtcbiAgfVxuXG4gIGdldCB2YWx1ZSgpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jbGVhck1hc2sodGhpcy5yYXdWYWx1ZSk7XG4gIH1cblxuICBzZXQgdmFsdWUodmFsdWU6IG51bWJlciB8IG51bGwpIHtcbiAgICB0aGlzLnJhd1ZhbHVlID0gdGhpcy5hcHBseU1hc2sodHJ1ZSwgJycgKyB2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIF9pc051bGxPclVuZGVmaW5lZCh2YWx1ZTogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkO1xuICB9XG59XG4iXX0=