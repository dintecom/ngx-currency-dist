import { Directive, forwardRef, HostListener, Inject, Input, Optional, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputHandler } from './input.handler';
import { NGX_CURRENCY_CONFIG, NgxCurrencyInputMode, } from './ngx-currency.config';
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.1", ngImport: i0, type: NgxCurrencyDirective, deps: [{ token: NGX_CURRENCY_CONFIG, optional: true }, { token: i0.KeyValueDiffers }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.1", type: NgxCurrencyDirective, isStandalone: true, selector: "[currencyMask]", inputs: { options: "options" }, host: { listeners: { "blur": "handleBlur($event)", "cut": "handleCut()", "input": "handleInput()", "keydown": "handleKeydown($event)", "keypress": "handleKeypress($event)", "paste": "handlePaste()", "drop": "handleDrop($event)" } }, providers: [
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWN1cnJlbmN5LmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jdXJyZW5jeS9zcmMvbGliL25neC1jdXJyZW5jeS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLFNBQVMsRUFHVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBSUwsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBd0IsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUNMLG1CQUFtQixFQUVuQixvQkFBb0IsR0FDckIsTUFBTSx1QkFBdUIsQ0FBQzs7QUFhL0IsTUFBTSxPQUFPLG9CQUFvQjtJQWEvQixZQUdFLGFBQXlDLEVBQ3pDLGVBQWdDLEVBQ2YsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFmakMsWUFBTyxHQUErQixFQUFFLENBQUM7UUFpQmhELElBQUksQ0FBQyxnQkFBZ0IsR0FBRztZQUN0QixLQUFLLEVBQUUsT0FBTztZQUNkLGFBQWEsRUFBRSxJQUFJO1lBQ25CLFNBQVMsRUFBRSxJQUFJO1lBQ2YsT0FBTyxFQUFFLEdBQUc7WUFDWixTQUFTLEVBQUUsQ0FBQztZQUNaLE1BQU0sRUFBRSxJQUFJO1lBQ1osTUFBTSxFQUFFLEVBQUU7WUFDVixTQUFTLEVBQUUsR0FBRztZQUNkLFFBQVEsRUFBRSxLQUFLO1lBQ2YsU0FBUyxFQUFFLG9CQUFvQixDQUFDLFNBQVM7WUFDekMsR0FBRyxhQUFhO1NBQ2pCLENBQUM7UUFFRixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDM0QsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJ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LFdBQVc7c0JBRFYsWUFBWTt1QkFBQyxPQUFPO2dCQVFyQixhQUFhO3NCQURaLFlBQVk7dUJBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQVFuQyxjQUFjO3NCQURiLFlBQVk7dUJBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQVFwQyxXQUFXO3NCQURWLFlBQVk7dUJBQUMsT0FBTztnQkFRckIsVUFBVTtzQkFEVCxZQUFZO3VCQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIERpcmVjdGl2ZSxcbiAgRG9DaGVjayxcbiAgRWxlbWVudFJlZixcbiAgZm9yd2FyZFJlZixcbiAgSG9zdExpc3RlbmVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBLZXlWYWx1ZURpZmZlcixcbiAgS2V5VmFsdWVEaWZmZXJzLFxuICBPbkluaXQsXG4gIE9wdGlvbmFsLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgSW5wdXRIYW5kbGVyIH0gZnJvbSAnLi9pbnB1dC5oYW5kbGVyJztcbmltcG9ydCB7XG4gIE5HWF9DVVJSRU5DWV9DT05GSUcsXG4gIE5neEN1cnJlbmN5Q29uZmlnLFxuICBOZ3hDdXJyZW5jeUlucHV0TW9kZSxcbn0gZnJvbSAnLi9uZ3gtY3VycmVuY3kuY29uZmlnJztcblxuQERpcmVjdGl2ZSh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHNlbGVjdG9yOiAnW2N1cnJlbmN5TWFza10nLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5neEN1cnJlbmN5RGlyZWN0aXZlKSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIE5neEN1cnJlbmN5RGlyZWN0aXZlXG4gIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgQ29udHJvbFZhbHVlQWNjZXNzb3IsIERvQ2hlY2ssIE9uSW5pdFxue1xuICBASW5wdXQoKSBvcHRpb25zOiBQYXJ0aWFsPE5neEN1cnJlbmN5Q29uZmlnPiA9IHt9O1xuXG4gIHByaXZhdGUgX2lucHV0SGFuZGxlciE6IElucHV0SGFuZGxlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBfa2V5VmFsdWVEaWZmZXI6IEtleVZhbHVlRGlmZmVyPFxuICAgIGtleW9mIE5neEN1cnJlbmN5Q29uZmlnLFxuICAgIHVua25vd25cbiAgPjtcblxuICBwcml2YXRlIF9vcHRpb25zVGVtcGxhdGU6IE5neEN1cnJlbmN5Q29uZmlnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBPcHRpb25hbCgpXG4gICAgQEluamVjdChOR1hfQ1VSUkVOQ1lfQ09ORklHKVxuICAgIGdsb2JhbE9wdGlvbnM6IFBhcnRpYWw8Tmd4Q3VycmVuY3lDb25maWc+LFxuICAgIGtleVZhbHVlRGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICkge1xuICAgIHRoaXMuX29wdGlvbnNUZW1wbGF0ZSA9IHtcbiAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgYWxsb3dOZWdhdGl2ZTogdHJ1ZSxcbiAgICAgIGFsbG93WmVybzogdHJ1ZSxcbiAgICAgIGRlY2ltYWw6ICcuJyxcbiAgICAgIHByZWNpc2lvbjogMixcbiAgICAgIHByZWZpeDogJyQgJyxcbiAgICAgIHN1ZmZpeDogJycsXG4gICAgICB0aG91c2FuZHM6ICcsJyxcbiAgICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICAgIGlucHV0TW9kZTogTmd4Q3VycmVuY3lJbnB1dE1vZGUuRmluYW5jaWFsLFxuICAgICAgLi4uZ2xvYmFsT3B0aW9ucyxcbiAgICB9O1xuXG4gICAgdGhpcy5fa2V5VmFsdWVEaWZmZXIgPSBrZXlWYWx1ZURpZmZlcnMuZmluZCh7fSkuY3JlYXRlKCk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9pbnB1dEhhbmRsZXIgPSBuZXcgSW5wdXRIYW5kbGVyKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwge1xuICAgICAgLi4udGhpcy5fb3B0aW9uc1RlbXBsYXRlLFxuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zdHlsZS50ZXh0QWxpZ24gPVxuICAgICAgdGhpcy5vcHRpb25zPy5hbGlnbiA/PyB0aGlzLl9vcHRpb25zVGVtcGxhdGUuYWxpZ247XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgaWYgKHRoaXMuX2tleVZhbHVlRGlmZmVyLmRpZmYodGhpcy5vcHRpb25zKSkge1xuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnN0eWxlLnRleHRBbGlnbiA9XG4gICAgICAgIHRoaXMub3B0aW9ucz8uYWxpZ24gPz8gdGhpcy5fb3B0aW9uc1RlbXBsYXRlLmFsaWduO1xuXG4gICAgICB0aGlzLl9pbnB1dEhhbmRsZXIudXBkYXRlT3B0aW9ucyh7XG4gICAgICAgIC4uLnRoaXMuX29wdGlvbnNUZW1wbGF0ZSxcbiAgICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignYmx1cicsIFsnJGV2ZW50J10pXG4gIGhhbmRsZUJsdXIoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcbiAgICB0aGlzLl9pbnB1dEhhbmRsZXIuZ2V0T25Nb2RlbFRvdWNoZWQoKS5hcHBseShldmVudCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdjdXQnKVxuICBoYW5kbGVDdXQoKSB7XG4gICAgaWYgKCF0aGlzLmlzQ2hyb21lQW5kcm9pZCgpKSB7XG4gICAgICAhdGhpcy5pc1JlYWRPbmx5KCkgJiYgdGhpcy5faW5wdXRIYW5kbGVyLmhhbmRsZUN1dCgpO1xuICAgIH1cbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2lucHV0JylcbiAgaGFuZGxlSW5wdXQoKSB7XG4gICAgaWYgKHRoaXMuaXNDaHJvbWVBbmRyb2lkKCkpIHtcbiAgICAgICF0aGlzLmlzUmVhZE9ubHkoKSAmJiB0aGlzLl9pbnB1dEhhbmRsZXIuaGFuZGxlSW5wdXQoKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duJywgWyckZXZlbnQnXSlcbiAgaGFuZGxlS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICghdGhpcy5pc0Nocm9tZUFuZHJvaWQoKSkge1xuICAgICAgIXRoaXMuaXNSZWFkT25seSgpICYmIHRoaXMuX2lucHV0SGFuZGxlci5oYW5kbGVLZXlkb3duKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdrZXlwcmVzcycsIFsnJGV2ZW50J10pXG4gIGhhbmRsZUtleXByZXNzKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmlzQ2hyb21lQW5kcm9pZCgpKSB7XG4gICAgICAhdGhpcy5pc1JlYWRPbmx5KCkgJiYgdGhpcy5faW5wdXRIYW5kbGVyLmhhbmRsZUtleXByZXNzKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdwYXN0ZScpXG4gIGhhbmRsZVBhc3RlKCkge1xuICAgIGlmICghdGhpcy5pc0Nocm9tZUFuZHJvaWQoKSkge1xuICAgICAgIXRoaXMuaXNSZWFkT25seSgpICYmIHRoaXMuX2lucHV0SGFuZGxlci5oYW5kbGVQYXN0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2Ryb3AnLCBbJyRldmVudCddKVxuICBoYW5kbGVEcm9wKGV2ZW50OiBEcmFnRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuaXNDaHJvbWVBbmRyb2lkKCkpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgaXNDaHJvbWVBbmRyb2lkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICAvY2hyb21lL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJlxuICAgICAgL2FuZHJvaWQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgKTtcbiAgfVxuXG4gIGlzUmVhZE9ubHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3JlYWRvbmx5Jyk7XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGNhbGxiYWNrRnVuY3Rpb246ICh2YWx1ZTogbnVtYmVyIHwgbnVsbCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2lucHV0SGFuZGxlci5zZXRPbk1vZGVsQ2hhbmdlKGNhbGxiYWNrRnVuY3Rpb24pO1xuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoY2FsbGJhY2tGdW5jdGlvbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2lucHV0SGFuZGxlci5zZXRPbk1vZGVsVG91Y2hlZChjYWxsYmFja0Z1bmN0aW9uKTtcbiAgfVxuXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gIH1cblxuICB3cml0ZVZhbHVlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9pbnB1dEhhbmRsZXIuc2V0VmFsdWUodmFsdWUpO1xuICB9XG59XG4iXX0=