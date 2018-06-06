/// <reference types="react" />
import * as React from 'react';
export declare type Breakpoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export declare type BreakpointMap = {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    xxl?: string;
};
export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
    gutter?: number | BreakpointMap;
    type?: 'flex';
    align?: 'top' | 'middle' | 'bottom';
    justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
    prefixCls?: string;
}
export interface RowState {
    screens: BreakpointMap;
}
export default class Row extends React.Component<RowProps, RowState> {
    static defaultProps: {
        gutter: number;
    };
    static propTypes: {
        type: any;
        align: any;
        justify: any;
        className: any;
        children: any;
        gutter: any;
        prefixCls: any;
    };
    state: RowState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    getGutter(): string | number | BreakpointMap | undefined;
    render(): JSX.Element;
}
