import { InputManager } from './input.manager';
import { NgxCurrencyConfig } from './ngx-currency.config';
export declare class InputService {
    private _options;
    private readonly _singleDigitRegex;
    private readonly _onlyNumbersRegex;
    private readonly _perArNumber;
    inputManager: InputManager;
    constructor(htmlInputElement: HTMLInputElement, _options: NgxCurrencyConfig);
    addNumber(keyCode: number): void;
    applyMask(isNumber: boolean, rawValue: string, disablePadAndTrim?: boolean): string;
    padOrTrimPrecision(rawValue: string): string;
    clearMask(rawValue: string | null): number | null;
    changeToNegative(): void;
    changeToPositive(): void;
    removeNumber(keyCode: number): void;
    updateFieldValue(selectionStart?: number, disablePadAndTrim?: boolean): void;
    updateOptions(options: NgxCurrencyConfig): void;
    prefixLength(): number;
    suffixLength(): number;
    isNullable(): boolean;
    get canInputMoreNumbers(): boolean;
    get inputSelection(): {
        selectionStart: number;
        selectionEnd: number;
    };
    get rawValue(): string | null;
    set rawValue(value: string | null);
    get storedRawValue(): string;
    get value(): number | null;
    set value(value: number | null);
    private _isNullOrUndefined;
}
