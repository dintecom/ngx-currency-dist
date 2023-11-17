import { Directive, forwardRef, HostListener, Inject, Input, Optional, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputHandler } from './input.handler';
import { NgxCurrencyInputMode, NGX_CURRENCY_CONFIG, } from './ngx-currency.config';
import * as i0 from "@angular/core";
export class NgxCurrencyDirective {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.1", ngImport: i0, type: NgxCurrencyDirective, deps: [{ token: NGX_CURRENCY_CONFIG, optional: true }, { token: i0.KeyValueDiffers }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.0.1", type: NgxCurrencyDirective, isStandalone: true, selector: "[currencyMask]", inputs: { options: "options" }, host: { listeners: { "blur": "handleBlur($event)", "cut": "handleCut()", "input": "handleInput()", "keydown": "handleKeydown($event)", "keypress": "handleKeypress($event)", "paste": "handlePaste()", "drop": "handleDrop($event)" } }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NgxCurrencyDirective),
                multi: true,
            },
        ], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.1", ngImport: i0, type: NgxCurrencyDirective, decorators: [{
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
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_CURRENCY_CONFIG]
                }] }, { type: i0.KeyValueDiffers }, { type: i0.ElementRef }], propDecorators: { options: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWN1cnJlbmN5LmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jdXJyZW5jeS9zcmMvbGliL25neC1jdXJyZW5jeS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLFNBQVMsRUFHVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBSUwsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBd0IsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUVMLG9CQUFvQixFQUNwQixtQkFBbUIsR0FDcEIsTUFBTSx1QkFBdUIsQ0FBQzs7QUFhL0IsTUFBTSxPQUFPLG9CQUFvQjtJQWEvQixZQUdFLGFBQXlDLEVBQ3pDLGVBQWdDLEVBQ2YsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFmakMsWUFBTyxHQUErQixFQUFFLENBQUM7UUFpQmhELElBQUksQ0FBQyxnQkFBZ0IsR0FBRztZQUN0QixLQUFLLEVBQUUsT0FBTztZQUNkLGFBQWEsRUFBRSxJQUFJO1lBQ25CLFNBQVMsRUFBRSxJQUFJO1lBQ2YsT0FBTyxFQUFFLEdBQUc7WUFDWixTQUFTLEVBQUUsQ0FBQztZQUNaLE1BQU0sRUFBRSxJQUFJO1lBQ1osTUFBTSxFQUFFLEVBQUU7WUFDVixTQUFTLEVBQUUsR0FBRztZQUNkLFFBQVEsRUFBRSxLQUFLO1lBQ2YsU0FBUyxFQUFFLG9CQUFvQixDQUFDLFNBQVM7WUFDekMsR0FBRyxhQUFhO1NBQ2pCLENBQUM7UUFFRixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDM0QsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJ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QyxRQUFRLENBQUM7Z0JBUW5DLGNBQWM7c0JBRGIsWUFBWTt1QkFBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0JBUXBDLFdBQVc7c0JBRFYsWUFBWTt1QkFBQyxPQUFPO2dCQVFyQixVQUFVO3NCQURULFlBQVk7dUJBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBEb0NoZWNrLFxuICBFbGVtZW50UmVmLFxuICBmb3J3YXJkUmVmLFxuICBIb3N0TGlzdGVuZXIsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIEtleVZhbHVlRGlmZmVyLFxuICBLZXlWYWx1ZURpZmZlcnMsXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBJbnB1dEhhbmRsZXIgfSBmcm9tICcuL2lucHV0LmhhbmRsZXInO1xuaW1wb3J0IHtcbiAgTmd4Q3VycmVuY3lDb25maWcsXG4gIE5neEN1cnJlbmN5SW5wdXRNb2RlLFxuICBOR1hfQ1VSUkVOQ1lfQ09ORklHLFxufSBmcm9tICcuL25neC1jdXJyZW5jeS5jb25maWcnO1xuXG5ARGlyZWN0aXZlKHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc2VsZWN0b3I6ICdbY3VycmVuY3lNYXNrXScsXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmd4Q3VycmVuY3lEaXJlY3RpdmUpLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgTmd4Q3VycmVuY3lEaXJlY3RpdmVcbiAgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBDb250cm9sVmFsdWVBY2Nlc3NvciwgRG9DaGVjaywgT25Jbml0XG57XG4gIEBJbnB1dCgpIG9wdGlvbnM6IFBhcnRpYWw8Tmd4Q3VycmVuY3lDb25maWc+ID0ge307XG5cbiAgcHJpdmF0ZSBfaW5wdXRIYW5kbGVyITogSW5wdXRIYW5kbGVyO1xuICBwcml2YXRlIHJlYWRvbmx5IF9rZXlWYWx1ZURpZmZlcjogS2V5VmFsdWVEaWZmZXI8XG4gICAga2V5b2YgTmd4Q3VycmVuY3lDb25maWcsXG4gICAgdW5rbm93blxuICA+O1xuXG4gIHByaXZhdGUgX29wdGlvbnNUZW1wbGF0ZTogTmd4Q3VycmVuY3lDb25maWc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQE9wdGlvbmFsKClcbiAgICBASW5qZWN0KE5HWF9DVVJSRU5DWV9DT05GSUcpXG4gICAgZ2xvYmFsT3B0aW9uczogUGFydGlhbDxOZ3hDdXJyZW5jeUNvbmZpZz4sXG4gICAga2V5VmFsdWVEaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZlxuICApIHtcbiAgICB0aGlzLl9vcHRpb25zVGVtcGxhdGUgPSB7XG4gICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgIGFsbG93TmVnYXRpdmU6IHRydWUsXG4gICAgICBhbGxvd1plcm86IHRydWUsXG4gICAgICBkZWNpbWFsOiAnLicsXG4gICAgICBwcmVjaXNpb246IDIsXG4gICAgICBwcmVmaXg6ICckICcsXG4gICAgICBzdWZmaXg6ICcnLFxuICAgICAgdGhvdXNhbmRzOiAnLCcsXG4gICAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgICBpbnB1dE1vZGU6IE5neEN1cnJlbmN5SW5wdXRNb2RlLkZpbmFuY2lhbCxcbiAgICAgIC4uLmdsb2JhbE9wdGlvbnMsXG4gICAgfTtcblxuICAgIHRoaXMuX2tleVZhbHVlRGlmZmVyID0ga2V5VmFsdWVEaWZmZXJzLmZpbmQoe30pLmNyZWF0ZSgpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5faW5wdXRIYW5kbGVyID0gbmV3IElucHV0SGFuZGxlcih0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHtcbiAgICAgIC4uLnRoaXMuX29wdGlvbnNUZW1wbGF0ZSxcbiAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICB9KTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc3R5bGUudGV4dEFsaWduID1cbiAgICAgIHRoaXMub3B0aW9ucz8uYWxpZ24gPz8gdGhpcy5fb3B0aW9uc1RlbXBsYXRlLmFsaWduO1xuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGlmICh0aGlzLl9rZXlWYWx1ZURpZmZlci5kaWZmKHRoaXMub3B0aW9ucykpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zdHlsZS50ZXh0QWxpZ24gPVxuICAgICAgICB0aGlzLm9wdGlvbnM/LmFsaWduID8/IHRoaXMuX29wdGlvbnNUZW1wbGF0ZS5hbGlnbjtcblxuICAgICAgdGhpcy5faW5wdXRIYW5kbGVyLnVwZGF0ZU9wdGlvbnMoe1xuICAgICAgICAuLi50aGlzLl9vcHRpb25zVGVtcGxhdGUsXG4gICAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2JsdXInLCBbJyRldmVudCddKVxuICBoYW5kbGVCbHVyKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG4gICAgdGhpcy5faW5wdXRIYW5kbGVyLmdldE9uTW9kZWxUb3VjaGVkKCkuYXBwbHkoZXZlbnQpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignY3V0JylcbiAgaGFuZGxlQ3V0KCkge1xuICAgIGlmICghdGhpcy5pc0Nocm9tZUFuZHJvaWQoKSkge1xuICAgICAgIXRoaXMuaXNSZWFkT25seSgpICYmIHRoaXMuX2lucHV0SGFuZGxlci5oYW5kbGVDdXQoKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdpbnB1dCcpXG4gIGhhbmRsZUlucHV0KCkge1xuICAgIGlmICh0aGlzLmlzQ2hyb21lQW5kcm9pZCgpKSB7XG4gICAgICAhdGhpcy5pc1JlYWRPbmx5KCkgJiYgdGhpcy5faW5wdXRIYW5kbGVyLmhhbmRsZUlucHV0KCk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bicsIFsnJGV2ZW50J10pXG4gIGhhbmRsZUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuaXNDaHJvbWVBbmRyb2lkKCkpIHtcbiAgICAgICF0aGlzLmlzUmVhZE9ubHkoKSAmJiB0aGlzLl9pbnB1dEhhbmRsZXIuaGFuZGxlS2V5ZG93bihldmVudCk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcigna2V5cHJlc3MnLCBbJyRldmVudCddKVxuICBoYW5kbGVLZXlwcmVzcyhldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICghdGhpcy5pc0Nocm9tZUFuZHJvaWQoKSkge1xuICAgICAgIXRoaXMuaXNSZWFkT25seSgpICYmIHRoaXMuX2lucHV0SGFuZGxlci5oYW5kbGVLZXlwcmVzcyhldmVudCk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcigncGFzdGUnKVxuICBoYW5kbGVQYXN0ZSgpIHtcbiAgICBpZiAoIXRoaXMuaXNDaHJvbWVBbmRyb2lkKCkpIHtcbiAgICAgICF0aGlzLmlzUmVhZE9ubHkoKSAmJiB0aGlzLl9pbnB1dEhhbmRsZXIuaGFuZGxlUGFzdGUoKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkcm9wJywgWyckZXZlbnQnXSlcbiAgaGFuZGxlRHJvcChldmVudDogRHJhZ0V2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmlzQ2hyb21lQW5kcm9pZCgpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIGlzQ2hyb21lQW5kcm9pZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgL2Nocm9tZS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiZcbiAgICAgIC9hbmRyb2lkL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KVxuICAgICk7XG4gIH1cblxuICBpc1JlYWRPbmx5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuaGFzQXR0cmlidXRlKCdyZWFkb25seScpO1xuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShjYWxsYmFja0Z1bmN0aW9uOiAodmFsdWU6IG51bWJlciB8IG51bGwpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9pbnB1dEhhbmRsZXIuc2V0T25Nb2RlbENoYW5nZShjYWxsYmFja0Z1bmN0aW9uKTtcbiAgfVxuXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGNhbGxiYWNrRnVuY3Rpb246ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9pbnB1dEhhbmRsZXIuc2V0T25Nb2RlbFRvdWNoZWQoY2FsbGJhY2tGdW5jdGlvbik7XG4gIH1cblxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZGlzYWJsZWQgPSBpc0Rpc2FibGVkO1xuICB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5faW5wdXRIYW5kbGVyLnNldFZhbHVlKHZhbHVlKTtcbiAgfVxufVxuIl19