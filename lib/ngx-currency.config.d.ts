import { InjectionToken } from '@angular/core';
export interface NgxCurrencyConfig {
    align: string;
    allowNegative: boolean;
    allowZero: boolean;
    decimal: string;
    precision: number;
    prefix: string;
    suffix: string;
    thousands: string;
    nullable: boolean;
    min?: number;
    max?: number;
    inputMode?: NgxCurrencyInputMode;
}
export declare enum NgxCurrencyInputMode {
    Financial = 0,
    Natural = 1
}
export declare const NGX_CURRENCY_CONFIG: InjectionToken<Partial<NgxCurrencyConfig>>;
