import * as i0 from '@angular/core';
import { InjectionToken, inject, ElementRef, KeyValueDiffers, forwardRef, HostListener, Input, Directive, makeEnvironmentProviders } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

var NgxCurrencyInputMode;
(function (NgxCurrencyInputMode) {
    NgxCurrencyInputMode[NgxCurrencyInputMode["Financial"] = 0] = "Financial";
    NgxCurrencyInputMode[NgxCurrencyInputMode["Natural"] = 1] = "Natural";
})(NgxCurrencyInputMode || (NgxCurrencyInputMode = {}));
const NGX_CURRENCY_CONFIG = new InjectionToken('ngx-currency.config');

class InputManager {
    _htmlInputElement;
    _storedRawValue = null;
    constructor(_htmlInputElement) {
        this._htmlInputElement = _htmlInputElement;
    }
    setCursorAt(position) {
        this._htmlInputElement.focus();
        this._htmlInputElement.setSelectionRange(position, position);
    }
    updateValueAndCursor(newRawValue, oldLength, selectionStart) {
        this.rawValue = newRawValue;
        const newLength = newRawValue.length;
        selectionStart = selectionStart - (oldLength - newLength);
        this.setCursorAt(selectionStart);
    }
    get canInputMoreNumbers() {
        const onlyNumbers = this.rawValue?.replace(/[^0-9\u0660-\u0669\u06F0-\u06F9]/g, '') ?? '';
        const hasReachedMaxLength = !(onlyNumbers.length >= this._htmlInputElement.maxLength &&
            this._htmlInputElement.maxLength >= 0);
        const selectionStart = this.inputSelection.selectionStart;
        const selectionEnd = this.inputSelection.selectionEnd;
        const haveNumberSelected = !!(selectionStart != selectionEnd &&
            this._htmlInputElement.value
                .substring(selectionStart, selectionEnd)
                .match(/[^0-9\u0660-\u0669\u06F0-\u06F9]/));
        const startWithZero = this._htmlInputElement.value.substring(0, 1) == '0';
        return hasReachedMaxLength || haveNumberSelected || startWithZero;
    }
    get inputSelection() {
        return {
            selectionStart: this._htmlInputElement.selectionStart ?? 0,
            selectionEnd: this._htmlInputElement.selectionEnd ?? 0,
        };
    }
    get rawValue() {
        return this._htmlInputElement && this._htmlInputElement.value;
    }
    set rawValue(value) {
        this._storedRawValue = value;
        if (this._htmlInputElement) {
            this._htmlInputElement.value = value ?? '';
        }
    }
    get storedRawValue() {
        return this._storedRawValue || '';
    }
}

class InputService {
    _options;
    _singleDigitRegex = new RegExp(/^[0-9\u0660-\u0669\u06F0-\u06F9]$/);
    _onlyNumbersRegex = new RegExp(/[^0-9\u0660-\u0669\u06F0-\u06F9]/g);
    _perArNumber = new Map([
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
    inputManager;
    constructor(htmlInputElement, _options) {
        this._options = _options;
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

class InputHandler {
    inputService;
    onModelChange = () => undefined;
    onModelTouched = () => undefined;
    constructor(htmlInputElement, options) {
        this.inputService = new InputService(htmlInputElement, options);
    }
    handleCut() {
        setTimeout(() => {
            this.inputService.updateFieldValue();
            this.setValue(this.inputService.value);
            this.onModelChange(this.inputService.value);
        }, 0);
    }
    handleInput() {
        const rawValue = this.inputService.rawValue ?? '';
        const selectionStart = this.inputService.inputSelection.selectionStart;
        const keyCode = rawValue.charCodeAt(selectionStart - 1);
        const rawValueLength = rawValue.length;
        const storedRawValueLength = this.inputService.storedRawValue.length;
        if (Math.abs(rawValueLength - storedRawValueLength) != 1) {
            this.inputService.updateFieldValue(selectionStart);
            this.onModelChange(this.inputService.value);
            return;
        }
        // Restore the old value.
        this.inputService.rawValue = this.inputService.storedRawValue;
        if (rawValueLength < storedRawValueLength) {
            // Chrome Android seems to move the cursor in response to a backspace AFTER processing the
            // input event, so we need to wrap this in a timeout.
            this.timer(() => {
                // Move the cursor to just after the deleted value.
                this.inputService.updateFieldValue(selectionStart + 1);
                // Then backspace it.
                this.inputService.removeNumber(8);
                this.onModelChange(this.inputService.value);
            }, 0);
        }
        if (rawValueLength > storedRawValueLength) {
            // Move the cursor to just before the new value.
            this.inputService.updateFieldValue(selectionStart - 1);
            // Process the character like a keypress.
            this._handleKeypressImpl(keyCode);
        }
    }
    handleKeydown(event) {
        const keyCode = event.which || event.charCode || event.keyCode;
        if (keyCode == 8 || keyCode == 46 || keyCode == 63272) {
            event.preventDefault();
            if (this.inputService.inputSelection.selectionStart <=
                this.inputService.prefixLength() &&
                this.inputService.inputSelection.selectionEnd >=
                    (this.inputService.rawValue?.length ?? 0) -
                        this.inputService.suffixLength()) {
                this.clearValue();
            }
            else {
                this.inputService.removeNumber(keyCode);
                this.onModelChange(this.inputService.value);
            }
        }
    }
    clearValue() {
        this.setValue(this.inputService.isNullable() ? null : 0);
        this.onModelChange(this.inputService.value);
    }
    handleKeypress(event) {
        const keyCode = event.which || event.charCode || event.keyCode;
        event.preventDefault();
        if (keyCode === 97 && event.ctrlKey) {
            return;
        }
        this._handleKeypressImpl(keyCode);
    }
    _handleKeypressImpl(keyCode) {
        switch (keyCode) {
            case undefined:
            case 9:
            case 13:
                return;
            case 43:
                this.inputService.changeToPositive();
                break;
            case 45:
                this.inputService.changeToNegative();
                break;
            default:
                if (this.inputService.canInputMoreNumbers) {
                    const selectionRangeLength = Math.abs(this.inputService.inputSelection.selectionEnd -
                        this.inputService.inputSelection.selectionStart);
                    if (selectionRangeLength == (this.inputService.rawValue?.length ?? 0)) {
                        this.setValue(null);
                    }
                    this.inputService.addNumber(keyCode);
                }
                break;
        }
        this.onModelChange(this.inputService.value);
    }
    handlePaste() {
        setTimeout(() => {
            this.inputService.updateFieldValue();
            this.setValue(this.inputService.value);
            this.onModelChange(this.inputService.value);
        }, 1);
    }
    updateOptions(options) {
        this.inputService.updateOptions(options);
    }
    getOnModelChange() {
        return this.onModelChange;
    }
    setOnModelChange(callbackFunction) {
        this.onModelChange = callbackFunction;
    }
    getOnModelTouched() {
        return this.onModelTouched;
    }
    setOnModelTouched(callbackFunction) {
        this.onModelTouched = callbackFunction;
    }
    setValue(value) {
        this.inputService.value = value;
    }
    /**
     * Passthrough to setTimeout that can be stubbed out in tests.
     */
    timer(callback, delayMilliseconds) {
        setTimeout(callback, delayMilliseconds);
    }
}

class NgxCurrencyDirective {
    _elementRef = inject(ElementRef);
    set currencyMask(value) {
        if (typeof value === 'string')
            return;
        this._options = value;
    }
    /**
     * @deprecated Use currencyMask input instead
     */
    set options(value) {
        this._options = value;
    }
    _inputHandler;
    _keyValueDiffer;
    _options = {};
    _optionsTemplate;
    constructor() {
        const globalOptions = inject(NGX_CURRENCY_CONFIG, { optional: true });
        const keyValueDiffers = inject(KeyValueDiffers);
        this._optionsTemplate = {
            align: 'right',
            allowNegative: true,
            allowZero: true,
            decimal: '.',
            precision: 2,
            prefix: '$ ',
            suffix: '',
            thousands: ',',
            nullable: false,
            inputMode: NgxCurrencyInputMode.Financial,
            ...globalOptions,
        };
        this._keyValueDiffer = keyValueDiffers.find({}).create();
        this._inputHandler = new InputHandler(this._elementRef.nativeElement, {
            ...this._optionsTemplate,
            ...this._options,
        });
    }
    ngAfterViewInit() {
        this._elementRef.nativeElement.style.textAlign =
            this._options?.align ?? this._optionsTemplate.align;
    }
    ngDoCheck() {
        if (this._keyValueDiffer.diff(this._options)) {
            this._elementRef.nativeElement.style.textAlign =
                this._options?.align ?? this._optionsTemplate.align;
            this._inputHandler.updateOptions({
                ...this._optionsTemplate,
                ...this._options,
            });
        }
    }
    handleBlur(event) {
        this._inputHandler.getOnModelTouched().apply(event);
    }
    handleCut() {
        if (!this.isChromeAndroid()) {
            if (!this.isReadOnly())
                this._inputHandler.handleCut();
        }
    }
    handleInput() {
        if (this.isChromeAndroid()) {
            if (!this.isReadOnly())
                this._inputHandler.handleInput();
        }
    }
    handleKeydown(event) {
        if (!this.isChromeAndroid()) {
            if (!this.isReadOnly())
                this._inputHandler.handleKeydown(event);
        }
    }
    handleKeypress(event) {
        if (!this.isChromeAndroid()) {
            if (!this.isReadOnly())
                this._inputHandler.handleKeypress(event);
        }
    }
    handlePaste() {
        if (!this.isChromeAndroid()) {
            if (!this.isReadOnly())
                this._inputHandler.handlePaste();
        }
    }
    handleDrop(event) {
        if (!this.isChromeAndroid()) {
            event.preventDefault();
        }
    }
    isChromeAndroid() {
        return (/chrome/i.test(navigator.userAgent) &&
            /android/i.test(navigator.userAgent));
    }
    isReadOnly() {
        return this._elementRef.nativeElement.hasAttribute('readonly');
    }
    registerOnChange(callbackFunction) {
        this._inputHandler.setOnModelChange(callbackFunction);
    }
    registerOnTouched(callbackFunction) {
        this._inputHandler.setOnModelTouched(callbackFunction);
    }
    setDisabledState(isDisabled) {
        this._elementRef.nativeElement.disabled = isDisabled;
    }
    writeValue(value) {
        this._inputHandler.setValue(value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.3", ngImport: i0, type: NgxCurrencyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.3", type: NgxCurrencyDirective, isStandalone: true, selector: "input[currencyMask]", inputs: { currencyMask: "currencyMask", options: "options" }, host: { listeners: { "blur": "handleBlur($event)", "cut": "handleCut()", "input": "handleInput()", "keydown": "handleKeydown($event)", "keypress": "handleKeypress($event)", "paste": "handlePaste()", "drop": "handleDrop($event)" } }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NgxCurrencyDirective),
                multi: true,
            },
        ], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.3", ngImport: i0, type: NgxCurrencyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[currencyMask]',
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NgxCurrencyDirective),
                            multi: true,
                        },
                    ],
                }]
        }], ctorParameters: () => [], propDecorators: { currencyMask: [{
                type: Input
            }], options: [{
                type: Input
            }], handleBlur: [{
                type: HostListener,
                args: ['blur', ['$event']]
            }], handleCut: [{
                type: HostListener,
                args: ['cut']
            }], handleInput: [{
                type: HostListener,
                args: ['input']
            }], handleKeydown: [{
                type: HostListener,
                args: ['keydown', ['$event']]
            }], handleKeypress: [{
                type: HostListener,
                args: ['keypress', ['$event']]
            }], handlePaste: [{
                type: HostListener,
                args: ['paste']
            }], handleDrop: [{
                type: HostListener,
                args: ['drop', ['$event']]
            }] } });

function provideEnvironmentNgxCurrency(config) {
    return makeEnvironmentProviders([
        {
            provide: NGX_CURRENCY_CONFIG,
            useValue: config,
        },
    ]);
}

/*
 * Public API Surface of ngx-currency
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NGX_CURRENCY_CONFIG, NgxCurrencyDirective, NgxCurrencyInputMode, provideEnvironmentNgxCurrency };
//# sourceMappingURL=ngx-currency.mjs.map
