import { InputService } from './input.service';
import { NgxCurrencyConfig } from './ngx-currency.config';
export declare class InputHandler {
    inputService: InputService;
    onModelChange: (value: number | null) => void;
    onModelTouched: () => void;
    constructor(htmlInputElement: HTMLInputElement, options: NgxCurrencyConfig);
    handleCut(): void;
    handleInput(): void;
    handleKeydown(event: KeyboardEvent): void;
    clearValue(): void;
    handleKeypress(event: KeyboardEvent): void;
    private _handleKeypressImpl;
    handlePaste(): void;
    updateOptions(options: NgxCurrencyConfig): void;
    getOnModelChange(): (value: number | null) => void;
    setOnModelChange(callbackFunction: (value: number | null) => void): void;
    getOnModelTouched(): () => void;
    setOnModelTouched(callbackFunction: () => void): void;
    setValue(value: number | null): void;
    /**
     * Passthrough to setTimeout that can be stubbed out in tests.
     */
    timer(callback: () => void, delayMilliseconds: number): void;
}
