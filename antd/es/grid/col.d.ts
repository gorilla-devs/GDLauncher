/// <reference types="react" />
import * as React from 'react';
export interface ColSize {
    span?: number;
    order?: number;
    offset?: number;
    push?: number;
    pull?: number;
}
export interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
    span?: number;
    order?: number;
    offset?: number;
    push?: number;
    pull?: number;
    xs?: number | ColSize;
    sm?: number | ColSize;
    md?: number | ColSize;
    lg?: number | ColSize;
    xl?: number | ColSize;
    xxl?: number | ColSize;
    prefixCls?: string;
}
export default class Col extends React.Component<ColProps, {}> {
    static propTypes: {
        span: any;
        order: any;
        offset: any;
        push: any;
        pull: any;
        className: any;
        children: any;
        xs: any;
        sm: any;
        md: any;
        lg: any;
        xl: any;
        xxl: any;
    };
    render(): JSX.Element;
}
