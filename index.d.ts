import * as i0 from '@angular/core';
import { InjectionToken, AfterViewInit, DoCheck, EnvironmentProviders } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

interface NgxCurrencyConfig {
    align: string;
    allowNegative: boolean;
    allowZero: boolean;
    decimal: string;
    precision: number;
    prefix: string;
    suffix: string;
    thousands: string;
    nullable: boolean;
    min?: number | null;
    max?: number | null;
    inputMode?: NgxCurrencyInputMode;
}
declare enum NgxCurrencyInputMode {
    Financial = 0,
    Natural = 1
}
declare const NGX_CURRENCY_CONFIG: InjectionToken<Partial<NgxCurrencyConfig>>;

declare class NgxCurrencyDirective implements AfterViewInit, ControlValueAccessor, DoCheck {
    private readonly _elementRef;
    set currencyMask(value: Partial<NgxCurrencyConfig> | string);
    /**
     * @deprecated Use currencyMask input instead
     */
    set options(value: Partial<NgxCurrencyConfig>);
    private readonly _inputHandler;
    private readonly _keyValueDiffer;
    private _options;
    private readonly _optionsTemplate;
    constructor();
    ngAfterViewInit(): void;
    ngDoCheck(): void;
    handleBlur(event: FocusEvent): void;
    handleCut(): void;
    handleInput(): void;
    handleKeydown(event: KeyboardEvent): void;
    handleKeypress(event: KeyboardEvent): void;
    handlePaste(): void;
    handleDrop(event: DragEvent): void;
    isChromeAndroid(): boolean;
    isReadOnly(): boolean;
    registerOnChange(callbackFunction: (value: number | null) => void): void;
    registerOnTouched(callbackFunction: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxCurrencyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgxCurrencyDirective, "input[currencyMask]", never, { "currencyMask": { "alias": "currencyMask"; "required": false; }; "options": { "alias": "options"; "required": false; }; }, {}, never, never, true, never>;
}

declare function provideEnvironmentNgxCurrency(config: Partial<NgxCurrencyConfig>): EnvironmentProviders;

export { NGX_CURRENCY_CONFIG, NgxCurrencyDirective, NgxCurrencyInputMode, provideEnvironmentNgxCurrency };
export type { NgxCurrencyConfig };
