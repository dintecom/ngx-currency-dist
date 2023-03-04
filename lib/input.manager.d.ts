export declare class InputManager {
    private readonly _htmlInputElement;
    private _storedRawValue;
    constructor(_htmlInputElement: HTMLInputElement);
    setCursorAt(position: number): void;
    updateValueAndCursor(newRawValue: string, oldLength: number, selectionStart: number): void;
    get canInputMoreNumbers(): boolean;
    get inputSelection(): {
        selectionStart: number;
        selectionEnd: number;
    };
    get rawValue(): string | null;
    set rawValue(value: string | null);
    get storedRawValue(): string;
}
