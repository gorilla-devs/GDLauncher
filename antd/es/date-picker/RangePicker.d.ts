/// <reference types="react" />
import * as React from 'react';
import { RangePickerValue, RangePickerPresetRange } from './interface';
export interface RangePickerState {
    value?: RangePickerValue;
    showDate?: RangePickerValue;
    open?: boolean;
    hoverValue?: RangePickerValue;
}
export default class RangePicker extends React.Component<any, RangePickerState> {
    static defaultProps: {
        prefixCls: string;
        allowClear: boolean;
        showToday: boolean;
    };
    private picker;
    constructor(props: any);
    componentWillReceiveProps(nextProps: any): void;
    clearSelection: (e: React.MouseEvent<HTMLElement>) => void;
    clearHoverValue: () => void;
    handleChange: (value: RangePickerValue) => void;
    handleOpenChange: (open: boolean) => void;
    handleShowDateChange: (showDate: RangePickerValue) => void;
    handleHoverChange: (hoverValue: any) => void;
    handleRangeMouseLeave: () => void;
    handleCalendarInputSelect: (value: RangePickerValue) => void;
    handleRangeClick: (value: RangePickerPresetRange) => void;
    setValue(value: RangePickerValue, hidePanel?: boolean): void;
    focus(): void;
    blur(): void;
    savePicker: (node: HTMLSpanElement) => void;
    renderFooter: (...args: any[]) => (JSX.Element | null)[] | null;
    render(): JSX.Element;
}
