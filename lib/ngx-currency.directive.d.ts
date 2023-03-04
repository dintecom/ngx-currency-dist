import { AfterViewInit, DoCheck, ElementRef, KeyValueDiffers, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgxCurrencyConfig } from './ngx-currency.config';
import * as i0 from "@angular/core";
export declare class NgxCurrencyDirective implements AfterViewInit, ControlValueAccessor, DoCheck, OnInit {
    private readonly _elementRef;
    options: Partial<NgxCurrencyConfig>;
    private _inputHandler;
    private readonly _keyValueDiffer;
    private _optionsTemplate;
    constructor(globalOptions: Partial<NgxCurrencyConfig>, keyValueDiffers: KeyValueDiffers, _elementRef: ElementRef);
    ngOnInit(): void;
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
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxCurrencyDirective, [{ optional: true; }, null, null]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgxCurrencyDirective, "[currencyMask]", never, { "options": "options"; }, {}, never, never, true, never>;
}