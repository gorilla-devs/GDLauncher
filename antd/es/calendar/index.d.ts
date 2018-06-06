/// <reference types="react" />
import * as React from 'react';
import * as moment from 'moment';
export { HeaderProps } from './Header';
export declare type CalendarMode = 'month' | 'year';
export interface CalendarProps {
    prefixCls?: string;
    className?: string;
    value?: moment.Moment;
    defaultValue?: moment.Moment;
    mode?: CalendarMode;
    fullscreen?: boolean;
    dateCellRender?: (date: moment.Moment) => React.ReactNode;
    monthCellRender?: (date: moment.Moment) => React.ReactNode;
    dateFullCellRender?: (date: moment.Moment) => React.ReactNode;
    monthFullCellRender?: (date: moment.Moment) => React.ReactNode;
    locale?: any;
    style?: React.CSSProperties;
    onPanelChange?: (date?: moment.Moment, mode?: CalendarMode) => void;
    onSelect?: (date?: moment.Moment) => void;
    disabledDate?: (current: moment.Moment) => boolean;
    validRange?: [moment.Moment, moment.Moment];
}
export interface CalendarState {
    value: moment.Moment;
    mode?: CalendarMode;
}
export default class Calendar extends React.Component<CalendarProps, CalendarState> {
    static defaultProps: {
        locale: {};
        fullscreen: boolean;
        prefixCls: string;
        mode: string;
        onSelect: () => null;
        onPanelChange: () => null;
    };
    static propTypes: {
        monthCellRender: any;
        dateCellRender: any;
        monthFullCellRender: any;
        dateFullCellRender: any;
        fullscreen: any;
        locale: any;
        prefixCls: any;
        className: any;
        style: any;
        onPanelChange: any;
        value: any;
        onSelect: any;
    };
    constructor(props: CalendarProps);
    componentWillReceiveProps(nextProps: CalendarProps): void;
    monthCellRender: (value: moment.Moment) => JSX.Element;
    dateCellRender: (value: moment.Moment) => JSX.Element;
    setValue: (value: moment.Moment, way: "select" | "changePanel") => void;
    setType: (type: string) => void;
    onHeaderValueChange: (value: moment.Moment) => void;
    onHeaderTypeChange: (type: string) => void;
    onPanelChange(value: moment.Moment, mode: CalendarMode | undefined): void;
    onSelect: (value: moment.Moment) => void;
    getDateRange: (validRange: [moment.Moment, moment.Moment], disabledDate?: ((current: moment.Moment) => boolean) | undefined) => (current: moment.Moment) => boolean;
    renderCalendar: (locale: any, localeCode: string) => JSX.Element;
    render(): JSX.Element;
}
