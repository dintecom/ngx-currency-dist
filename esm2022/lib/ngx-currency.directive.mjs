import { Directive, forwardRef, HostListener, Inject, Input, Optional, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputHandler } from './input.handler';
import { NGX_CURRENCY_CONFIG, NgxCurrencyInputMode, } from './ngx-currency.config';
import * as i0 from "@angular/core";
export class NgxCurrencyDirective {
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
    constructor(globalOptions, keyValueDiffers, _elementRef) {
        this._elementRef = _elementRef;
        this._options = {};
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.1", ngImport: i0, type: NgxCurrencyDirective, deps: [{ token: NGX_CURRENCY_CONFIG, optional: true }, { token: i0.KeyValueDiffers }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.1", type: NgxCurrencyDirective, isStandalone: true, selector: "input[currencyMask]", inputs: { currencyMask: "currencyMask", options: "options" }, host: { listeners: { "blur": "handleBlur($event)", "cut": "handleCut()", "input": "handleInput()", "keydown": "handleKeydown($event)", "keypress": "handleKeypress($event)", "paste": "handlePaste()", "drop": "handleDrop($event)" } }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NgxCurrencyDirective),
                multi: true,
            },
        ], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.1", ngImport: i0, type: NgxCurrencyDirective, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'input[currencyMask]',
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NgxCurrencyDirective),
                            multi: true,
                        },
                    ],
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_CURRENCY_CONFIG]
                }] }, { type: i0.KeyValueDiffers }, { type: i0.ElementRef }], propDecorators: { currencyMask: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWN1cnJlbmN5LmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jdXJyZW5jeS9zcmMvbGliL25neC1jdXJyZW5jeS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLFNBQVMsRUFHVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBSUwsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBd0IsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUNMLG1CQUFtQixFQUVuQixvQkFBb0IsR0FDckIsTUFBTSx1QkFBdUIsQ0FBQzs7QUFhL0IsTUFBTSxPQUFPLG9CQUFvQjtJQUcvQixJQUNJLFlBQVksQ0FBQyxLQUEwQztRQUN6RCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVE7WUFBRSxPQUFPO1FBRXRDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7T0FFRztJQUNILElBQ0ksT0FBTyxDQUFDLEtBQWlDO1FBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLENBQUM7SUFXRCxZQUdFLGFBQXlDLEVBQ3pDLGVBQWdDLEVBQ2YsV0FBeUM7UUFBekMsZ0JBQVcsR0FBWCxXQUFXLENBQThCO1FBUnBELGFBQVEsR0FBK0IsRUFBRSxDQUFDO1FBVWhELElBQUksQ0FBQyxnQkFBZ0IsR0FBRztZQUN0QixLQUFLLEVBQUUsT0FBTztZQUNkLGFBQWEsRUFBRSxJQUFJO1lBQ25CLFNBQVMsRUFBRSxJQUFJO1lBQ2YsT0FBTyxFQUFFLEdBQUc7WUFDWixTQUFTLEVBQUUsQ0FBQztZQUNaLE1BQU0sRUFBRSxJQUFJO1lBQ1osTUFBTSxFQUFFLEVBQUU7WUFDVixT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LENBQUM7NEJBQ25ELEtBQUssRUFBRSxJQUFJO3lCQUNaO3FCQUNGO2lCQUNGOzswQkE2QkksUUFBUTs7MEJBQ1IsTUFBTTsyQkFBQyxtQkFBbUI7Z0dBekJ6QixZQUFZO3NCQURmLEtBQUs7Z0JBV0YsT0FBTztzQkFEVixLQUFLO2dCQStETixVQUFVO3NCQURULFlBQVk7dUJBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQU1oQyxTQUFTO3NCQURSLFlBQVk7dUJBQUMsS0FBSztnQkFRbkIsV0FBVztzQkFEVixZQUFZO3VCQUFDLE9BQU87Z0JBUXJCLGFBQWE7c0JBRFosWUFBWTt1QkFBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0JBUW5DLGNBQWM7c0JBRGIsWUFBWTt1QkFBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0JBUXBDLFdBQVc7c0JBRFYsWUFBWTt1QkFBQyxPQUFPO2dCQVFyQixVQUFVO3NCQURULFlBQVk7dUJBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBEb0NoZWNrLFxuICBFbGVtZW50UmVmLFxuICBmb3J3YXJkUmVmLFxuICBIb3N0TGlzdGVuZXIsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIEtleVZhbHVlRGlmZmVyLFxuICBLZXlWYWx1ZURpZmZlcnMsXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBJbnB1dEhhbmRsZXIgfSBmcm9tICcuL2lucHV0LmhhbmRsZXInO1xuaW1wb3J0IHtcbiAgTkdYX0NVUlJFTkNZX0NPTkZJRyxcbiAgTmd4Q3VycmVuY3lDb25maWcsXG4gIE5neEN1cnJlbmN5SW5wdXRNb2RlLFxufSBmcm9tICcuL25neC1jdXJyZW5jeS5jb25maWcnO1xuXG5ARGlyZWN0aXZlKHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc2VsZWN0b3I6ICdpbnB1dFtjdXJyZW5jeU1hc2tdJyxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ3hDdXJyZW5jeURpcmVjdGl2ZSksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBOZ3hDdXJyZW5jeURpcmVjdGl2ZVxuICBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBEb0NoZWNrLCBPbkluaXRcbntcbiAgQElucHV0KClcbiAgc2V0IGN1cnJlbmN5TWFzayh2YWx1ZTogUGFydGlhbDxOZ3hDdXJyZW5jeUNvbmZpZz4gfCBzdHJpbmcpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgcmV0dXJuO1xuXG4gICAgdGhpcy5fb3B0aW9ucyA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFVzZSBjdXJyZW5jeU1hc2sgaW5wdXQgaW5zdGVhZFxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG9wdGlvbnModmFsdWU6IFBhcnRpYWw8Tmd4Q3VycmVuY3lDb25maWc+KSB7XG4gICAgdGhpcy5fb3B0aW9ucyA9IHZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5wdXRIYW5kbGVyITogSW5wdXRIYW5kbGVyO1xuICBwcml2YXRlIHJlYWRvbmx5IF9rZXlWYWx1ZURpZmZlcjogS2V5VmFsdWVEaWZmZXI8XG4gICAga2V5b2YgTmd4Q3VycmVuY3lDb25maWcsXG4gICAgdW5rbm93blxuICA+O1xuXG4gIHByaXZhdGUgX29wdGlvbnM6IFBhcnRpYWw8Tmd4Q3VycmVuY3lDb25maWc+ID0ge307XG4gIHByaXZhdGUgcmVhZG9ubHkgX29wdGlvbnNUZW1wbGF0ZTogTmd4Q3VycmVuY3lDb25maWc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQE9wdGlvbmFsKClcbiAgICBASW5qZWN0KE5HWF9DVVJSRU5DWV9DT05GSUcpXG4gICAgZ2xvYmFsT3B0aW9uczogUGFydGlhbDxOZ3hDdXJyZW5jeUNvbmZpZz4sXG4gICAga2V5VmFsdWVEaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MSW5wdXRFbGVtZW50PixcbiAgKSB7XG4gICAgdGhpcy5fb3B0aW9uc1RlbXBsYXRlID0ge1xuICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICBhbGxvd05lZ2F0aXZlOiB0cnVlLFxuICAgICAgYWxsb3daZXJvOiB0cnVlLFxuICAgICAgZGVjaW1hbDogJy4nLFxuICAgICAgcHJlY2lzaW9uOiAyLFxuICAgICAgcHJlZml4OiAnJCAnLFxuICAgICAgc3VmZml4OiAnJyxcbiAgICAgIHRob3VzYW5kczogJywnLFxuICAgICAgbnVsbGFibGU6IGZhbHNlLFxuICAgICAgaW5wdXRNb2RlOiBOZ3hDdXJyZW5jeUlucHV0TW9kZS5GaW5hbmNpYWwsXG4gICAgICAuLi5nbG9iYWxPcHRpb25zLFxuICAgIH07XG5cbiAgICB0aGlzLl9rZXlWYWx1ZURpZmZlciA9IGtleVZhbHVlRGlmZmVycy5maW5kKHt9KS5jcmVhdGUoKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX2lucHV0SGFuZGxlciA9IG5ldyBJbnB1dEhhbmRsZXIodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB7XG4gICAgICAuLi50aGlzLl9vcHRpb25zVGVtcGxhdGUsXG4gICAgICAuLi50aGlzLl9vcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zdHlsZS50ZXh0QWxpZ24gPVxuICAgICAgdGhpcy5fb3B0aW9ucz8uYWxpZ24gPz8gdGhpcy5fb3B0aW9uc1RlbXBsYXRlLmFsaWduO1xuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGlmICh0aGlzLl9rZXlWYWx1ZURpZmZlci5kaWZmKHRoaXMuX29wdGlvbnMpKSB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc3R5bGUudGV4dEFsaWduID1cbiAgICAgICAgdGhpcy5fb3B0aW9ucz8uYWxpZ24gPz8gdGhpcy5fb3B0aW9uc1RlbXBsYXRlLmFsaWduO1xuXG4gICAgICB0aGlzLl9pbnB1dEhhbmRsZXIudXBkYXRlT3B0aW9ucyh7XG4gICAgICAgIC4uLnRoaXMuX29wdGlvbnNUZW1wbGF0ZSxcbiAgICAgICAgLi4udGhpcy5fb3B0aW9ucyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2JsdXInLCBbJyRldmVudCddKVxuICBoYW5kbGVCbHVyKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG4gICAgdGhpcy5faW5wdXRIYW5kbGVyLmdldE9uTW9kZWxUb3VjaGVkKCkuYXBwbHkoZXZlbnQpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignY3V0JylcbiAgaGFuZGxlQ3V0KCkge1xuICAgIGlmICghdGhpcy5pc0Nocm9tZUFuZHJvaWQoKSkge1xuICAgICAgIXRoaXMuaXNSZWFkT25seSgpICYmIHRoaXMuX2lucHV0SGFuZGxlci5oYW5kbGVDdXQoKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdpbnB1dCcpXG4gIGhhbmRsZUlucHV0KCkge1xuICAgIGlmICh0aGlzLmlzQ2hyb21lQW5kcm9pZCgpKSB7XG4gICAgICAhdGhpcy5pc1JlYWRPbmx5KCkgJiYgdGhpcy5faW5wdXRIYW5kbGVyLmhhbmRsZUlucHV0KCk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bicsIFsnJGV2ZW50J10pXG4gIGhhbmRsZUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuaXNDaHJvbWVBbmRyb2lkKCkpIHtcbiAgICAgICF0aGlzLmlzUmVhZE9ubHkoKSAmJiB0aGlzLl9pbnB1dEhhbmRsZXIuaGFuZGxlS2V5ZG93bihldmVudCk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcigna2V5cHJlc3MnLCBbJyRldmVudCddKVxuICBoYW5kbGVLZXlwcmVzcyhldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICghdGhpcy5pc0Nocm9tZUFuZHJvaWQoKSkge1xuICAgICAgIXRoaXMuaXNSZWFkT25seSgpICYmIHRoaXMuX2lucHV0SGFuZGxlci5oYW5kbGVLZXlwcmVzcyhldmVudCk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcigncGFzdGUnKVxuICBoYW5kbGVQYXN0ZSgpIHtcbiAgICBpZiAoIXRoaXMuaXNDaHJvbWVBbmRyb2lkKCkpIHtcbiAgICAgICF0aGlzLmlzUmVhZE9ubHkoKSAmJiB0aGlzLl9pbnB1dEhhbmRsZXIuaGFuZGxlUGFzdGUoKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkcm9wJywgWyckZXZlbnQnXSlcbiAgaGFuZGxlRHJvcChldmVudDogRHJhZ0V2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmlzQ2hyb21lQW5kcm9pZCgpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIGlzQ2hyb21lQW5kcm9pZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgL2Nocm9tZS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiZcbiAgICAgIC9hbmRyb2lkL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KVxuICAgICk7XG4gIH1cblxuICBpc1JlYWRPbmx5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuaGFzQXR0cmlidXRlKCdyZWFkb25seScpO1xuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShjYWxsYmFja0Z1bmN0aW9uOiAodmFsdWU6IG51bWJlciB8IG51bGwpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9pbnB1dEhhbmRsZXIuc2V0T25Nb2RlbENoYW5nZShjYWxsYmFja0Z1bmN0aW9uKTtcbiAgfVxuXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGNhbGxiYWNrRnVuY3Rpb246ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9pbnB1dEhhbmRsZXIuc2V0T25Nb2RlbFRvdWNoZWQoY2FsbGJhY2tGdW5jdGlvbik7XG4gIH1cblxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZGlzYWJsZWQgPSBpc0Rpc2FibGVkO1xuICB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5faW5wdXRIYW5kbGVyLnNldFZhbHVlKHZhbHVlKTtcbiAgfVxufVxuIl19