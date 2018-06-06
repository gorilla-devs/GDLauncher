/// <reference types="react" />
import * as React from 'react';
import { ListGridType } from './index';
export interface ListItemProps {
    className?: string;
    children?: React.ReactNode;
    prefixCls?: string;
    style?: React.CSSProperties;
    extra?: React.ReactNode;
    actions?: Array<React.ReactNode>;
    grid?: ListGridType;
}
export interface ListItemMetaProps {
    avatar?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
    description?: React.ReactNode;
    prefixCls?: string;
    style?: React.CSSProperties;
    title?: React.ReactNode;
}
export declare const Meta: (props: ListItemMetaProps) => JSX.Element;
export default class Item extends React.Component<ListItemProps, any> {
    static Meta: typeof Meta;
    static propTypes: {
        column: any;
        xs: any;
        sm: any;
        md: any;
        lg: any;
        xl: any;
        xxl: any;
    };
    static contextTypes: {
        grid: any;
    };
    render(): JSX.Element;
}
