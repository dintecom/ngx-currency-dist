import { Directive, forwardRef, HostListener, Inject, Input, Optional, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputHandler } from './input.handler';
import { NgxCurrencyInputMode, NGX_CURRENCY_CONFIG, } from './ngx-currency.config';
import * as i0 from "@angular/core";
class NgxCurrencyDirective {
    constructor(globalOptions, keyValueDiffers, _elementRef) {
        this._elementRef = _elementRef;
        this.options = {};
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
    }
    ngOnInit() {
        this._inputHandler = new InputHandler(this._elementRef.nativeElement, {
            ...this._optionsTemplate,
            ...this.options,
        });
    }
    ngAfterViewInit() {
        this._elementRef.nativeElement.style.textAlign =
            this.options?.align ?? this._optionsTemplate.align;
    }
    ngDoCheck() {
        if (this._keyValueDiffer.diff(this.options)) {
            this._elementRef.nativeElement.style.textAlign =
                this.options?.align ?? this._optionsTemplate.align;
            this._inputHandler.updateOptions({
                ...this._optionsTemplate,
                ...this.options,
            });
        }
    }
    handleBlur(event) {
        this._inputHandler.getOnModelTouched().apply(event);
    }
    handleCut() {
        if (!this.isChromeAndroid()) {
            !this.isReadOnly() && this._inputHandler.handleCut();
        }
    }
    handleInput() {
        if (this.isChromeAndroid()) {
            !this.isReadOnly() && this._inputHandler.handleInput();
        }
    }
    handleKeydown(event) {
        if (!this.isChromeAndroid()) {
            !this.isReadOnly() && this._inputHandler.handleKeydown(event);
        }
    }
    handleKeypress(event) {
        if (!this.isChromeAndroid()) {
            !this.isReadOnly() && this._inputHandler.handleKeypress(event);
        }
    }
    handlePaste() {
        if (!this.isChromeAndroid()) {
            !this.isReadOnly() && this._inputHandler.handlePaste();
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: NgxCurrencyDirective, deps: [{ token: NGX_CURRENCY_CONFIG, optional: true }, { token: i0.KeyValueDiffers }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0", type: NgxCurrencyDirective, isStandalone: true, selector: "[currencyMask]", inputs: { options: "options" }, host: { listeners: { "blur": "handleBlur($event)", "cut": "handleCut()", "input": "handleInput()", "keydown": "handleKeydown($event)", "keypress": "handleKeypress($event)", "paste": "handlePaste()", "drop": "handleDrop($event)" } }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NgxCurrencyDirective),
                multi: true,
            },
        ], ngImport: i0 }); }
}
export { NgxCurrencyDirective };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: NgxCurrencyDirective, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: '[currencyMask]',
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NgxCurrencyDirective),
                            multi: true,
                        },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_CURRENCY_CONFIG]
                }] }, { type: i0.KeyValueDiffers }, { type: i0.ElementRef }]; }, propDecorators: { options: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWN1cnJlbmN5LmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jdXJyZW5jeS9zcmMvbGliL25neC1jdXJyZW5jeS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLFNBQVMsRUFHVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBSUwsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBd0IsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUVMLG9CQUFvQixFQUNwQixtQkFBbUIsR0FDcEIsTUFBTSx1QkFBdUIsQ0FBQzs7QUFFL0IsTUFXYSxvQkFBb0I7SUFhL0IsWUFHRSxhQUF5QyxFQUN6QyxlQUFnQyxFQUNmLFdBQXVCO1FBQXZCLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBZmpDLFlBQU8sR0FBK0IsRUFBRSxDQUFDO1FBaUJoRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUc7WUFDdEIsS0FBSyxFQUFFLE9BQU87WUFDZCxhQUFhLEVBQUUsSUFBSTtZQUNuQixTQUFTLEVBQUUsSUFBSTtZQUNmLE9BQU8sRUFBRSxHQUFHO1lBQ1osU0FBUyxFQUFFLENBQUM7WUFDWixNQUFNLEVBQUUsSUFBSTtZQUNaLE1BQU0sRUFBRSxFQUFFO1lBQ1YsU0FBUyxFQUFFLEdBQUc7WUFDZCxRQUFRLEVBQUUsS0FBSztZQUNmLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxTQUFTO1lBQ3pDLEdBQUcsYUFBYTtTQUNqQixDQUFDO1FBRUYsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzNELENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxDQUFD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RUFBRSxDQUFDLFFBQVEsQ0FBQztnQkFRbkMsY0FBYztzQkFEYixZQUFZO3VCQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQztnQkFRcEMsV0FBVztzQkFEVixZQUFZO3VCQUFDLE9BQU87Z0JBUXJCLFVBQVU7c0JBRFQsWUFBWTt1QkFBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIERvQ2hlY2ssXG4gIEVsZW1lbnRSZWYsXG4gIGZvcndhcmRSZWYsXG4gIEhvc3RMaXN0ZW5lcixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgS2V5VmFsdWVEaWZmZXIsXG4gIEtleVZhbHVlRGlmZmVycyxcbiAgT25Jbml0LFxuICBPcHRpb25hbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUiB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IElucHV0SGFuZGxlciB9IGZyb20gJy4vaW5wdXQuaGFuZGxlcic7XG5pbXBvcnQge1xuICBOZ3hDdXJyZW5jeUNvbmZpZyxcbiAgTmd4Q3VycmVuY3lJbnB1dE1vZGUsXG4gIE5HWF9DVVJSRU5DWV9DT05GSUcsXG59IGZyb20gJy4vbmd4LWN1cnJlbmN5LmNvbmZpZyc7XG5cbkBEaXJlY3RpdmUoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBzZWxlY3RvcjogJ1tjdXJyZW5jeU1hc2tdJyxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ3hDdXJyZW5jeURpcmVjdGl2ZSksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBOZ3hDdXJyZW5jeURpcmVjdGl2ZVxuICBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBEb0NoZWNrLCBPbkluaXRcbntcbiAgQElucHV0KCkgb3B0aW9uczogUGFydGlhbDxOZ3hDdXJyZW5jeUNvbmZpZz4gPSB7fTtcblxuICBwcml2YXRlIF9pbnB1dEhhbmRsZXIhOiBJbnB1dEhhbmRsZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2tleVZhbHVlRGlmZmVyOiBLZXlWYWx1ZURpZmZlcjxcbiAgICBrZXlvZiBOZ3hDdXJyZW5jeUNvbmZpZyxcbiAgICB1bmtub3duXG4gID47XG5cbiAgcHJpdmF0ZSBfb3B0aW9uc1RlbXBsYXRlOiBOZ3hDdXJyZW5jeUNvbmZpZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKVxuICAgIEBJbmplY3QoTkdYX0NVUlJFTkNZX0NPTkZJRylcbiAgICBnbG9iYWxPcHRpb25zOiBQYXJ0aWFsPE5neEN1cnJlbmN5Q29uZmlnPixcbiAgICBrZXlWYWx1ZURpZmZlcnM6IEtleVZhbHVlRGlmZmVycyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmXG4gICkge1xuICAgIHRoaXMuX29wdGlvbnNUZW1wbGF0ZSA9IHtcbiAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgYWxsb3dOZWdhdGl2ZTogdHJ1ZSxcbiAgICAgIGFsbG93WmVybzogdHJ1ZSxcbiAgICAgIGRlY2ltYWw6ICcuJyxcbiAgICAgIHByZWNpc2lvbjogMixcbiAgICAgIHByZWZpeDogJyQgJyxcbiAgICAgIHN1ZmZpeDogJycsXG4gICAgICB0aG91c2FuZHM6ICcsJyxcbiAgICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICAgIGlucHV0TW9kZTogTmd4Q3VycmVuY3lJbnB1dE1vZGUuRmluYW5jaWFsLFxuICAgICAgLi4uZ2xvYmFsT3B0aW9ucyxcbiAgICB9O1xuXG4gICAgdGhpcy5fa2V5VmFsdWVEaWZmZXIgPSBrZXlWYWx1ZURpZmZlcnMuZmluZCh7fSkuY3JlYXRlKCk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9pbnB1dEhhbmRsZXIgPSBuZXcgSW5wdXRIYW5kbGVyKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwge1xuICAgICAgLi4udGhpcy5fb3B0aW9uc1RlbXBsYXRlLFxuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zdHlsZS50ZXh0QWxpZ24gPVxuICAgICAgdGhpcy5vcHRpb25zPy5hbGlnbiA/PyB0aGlzLl9vcHRpb25zVGVtcGxhdGUuYWxpZ247XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgaWYgKHRoaXMuX2tleVZhbHVlRGlmZmVyLmRpZmYodGhpcy5vcHRpb25zKSkge1xuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnN0eWxlLnRleHRBbGlnbiA9XG4gICAgICAgIHRoaXMub3B0aW9ucz8uYWxpZ24gPz8gdGhpcy5fb3B0aW9uc1RlbXBsYXRlLmFsaWduO1xuXG4gICAgICB0aGlzLl9pbnB1dEhhbmRsZXIudXBkYXRlT3B0aW9ucyh7XG4gICAgICAgIC4uLnRoaXMuX29wdGlvbnNUZW1wbGF0ZSxcbiAgICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignYmx1cicsIFsnJGV2ZW50J10pXG4gIGhhbmRsZUJsdXIoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcbiAgICB0aGlzLl9pbnB1dEhhbmRsZXIuZ2V0T25Nb2RlbFRvdWNoZWQoKS5hcHBseShldmVudCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdjdXQnKVxuICBoYW5kbGVDdXQoKSB7XG4gICAgaWYgKCF0aGlzLmlzQ2hyb21lQW5kcm9pZCgpKSB7XG4gICAgICAhdGhpcy5pc1JlYWRPbmx5KCkgJiYgdGhpcy5faW5wdXRIYW5kbGVyLmhhbmRsZUN1dCgpO1xuICAgIH1cbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2lucHV0JylcbiAgaGFuZGxlSW5wdXQoKSB7XG4gICAgaWYgKHRoaXMuaXNDaHJvbWVBbmRyb2lkKCkpIHtcbiAgICAgICF0aGlzLmlzUmVhZE9ubHkoKSAmJiB0aGlzLl9pbnB1dEhhbmRsZXIuaGFuZGxlSW5wdXQoKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duJywgWyckZXZlbnQnXSlcbiAgaGFuZGxlS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICghdGhpcy5pc0Nocm9tZUFuZHJvaWQoKSkge1xuICAgICAgIXRoaXMuaXNSZWFkT25seSgpICYmIHRoaXMuX2lucHV0SGFuZGxlci5oYW5kbGVLZXlkb3duKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdrZXlwcmVzcycsIFsnJGV2ZW50J10pXG4gIGhhbmRsZUtleXByZXNzKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmlzQ2hyb21lQW5kcm9pZCgpKSB7XG4gICAgICAhdGhpcy5pc1JlYWRPbmx5KCkgJiYgdGhpcy5faW5wdXRIYW5kbGVyLmhhbmRsZUtleXByZXNzKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdwYXN0ZScpXG4gIGhhbmRsZVBhc3RlKCkge1xuICAgIGlmICghdGhpcy5pc0Nocm9tZUFuZHJvaWQoKSkge1xuICAgICAgIXRoaXMuaXNSZWFkT25seSgpICYmIHRoaXMuX2lucHV0SGFuZGxlci5oYW5kbGVQYXN0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2Ryb3AnLCBbJyRldmVudCddKVxuICBoYW5kbGVEcm9wKGV2ZW50OiBEcmFnRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuaXNDaHJvbWVBbmRyb2lkKCkpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgaXNDaHJvbWVBbmRyb2lkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICAvY2hyb21lL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJlxuICAgICAgL2FuZHJvaWQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgKTtcbiAgfVxuXG4gIGlzUmVhZE9ubHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3JlYWRvbmx5Jyk7XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGNhbGxiYWNrRnVuY3Rpb246ICh2YWx1ZTogbnVtYmVyIHwgbnVsbCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2lucHV0SGFuZGxlci5zZXRPbk1vZGVsQ2hhbmdlKGNhbGxiYWNrRnVuY3Rpb24pO1xuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoY2FsbGJhY2tGdW5jdGlvbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2lucHV0SGFuZGxlci5zZXRPbk1vZGVsVG91Y2hlZChjYWxsYmFja0Z1bmN0aW9uKTtcbiAgfVxuXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gIH1cblxuICB3cml0ZVZhbHVlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9pbnB1dEhhbmRsZXIuc2V0VmFsdWUodmFsdWUpO1xuICB9XG59XG4iXX0=