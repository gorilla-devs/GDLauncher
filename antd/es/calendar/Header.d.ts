/// <reference types="react" />
import * as React from 'react';
import * as moment from 'moment';
import { RadioChangeEvent } from '../radio';
export interface HeaderProps {
    prefixCls?: string;
    locale?: any;
    fullscreen?: boolean;
    yearSelectOffset?: number;
    yearSelectTotal?: number;
    type?: string;
    onValueChange?: (value: moment.Moment) => void;
    onTypeChange?: (type: string) => void;
    value: any;
    validRange?: [moment.Moment, moment.Moment];
}
export default class Header extends React.Component<HeaderProps, any> {
    static defaultProps: {
        prefixCls: string;
        yearSelectOffset: number;
        yearSelectTotal: number;
    };
    private calenderHeaderNode;
    getYearSelectElement(year: number): JSX.Element;
    getMonthsLocale(value: moment.Moment): any[];
    getMonthSelectElement(month: number, months: number[]): JSX.Element;
    onYearChange: (year: string) => void;
    onMonthChange: (month: string) => void;
    onTypeChange: (e: RadioChangeEvent) => void;
    getCalenderHeaderNode: (node: HTMLDivElement) => void;
    render(): JSX.Element;
}
