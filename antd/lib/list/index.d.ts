/// <reference types="react" />
import * as React from 'react';
import { SpinProps } from '../spin';
import Item from './Item';
export { ListItemProps, ListItemMetaProps } from './Item';
export declare type ColumnCount = 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24;
export declare type ColumnType = 'gutter' | 'column' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export interface ListGridType {
    gutter?: number;
    column?: ColumnCount;
    xs?: ColumnCount;
    sm?: ColumnCount;
    md?: ColumnCount;
    lg?: ColumnCount;
    xl?: ColumnCount;
    xxl?: ColumnCount;
}
export declare type ListSize = 'small' | 'default' | 'large';
export interface ListProps {
    bordered?: boolean;
    className?: string;
    children?: React.ReactNode;
    dataSource: any;
    extra?: React.ReactNode;
    grid?: ListGridType;
    id?: string;
    itemLayout?: string;
    loading?: boolean | SpinProps;
    loadMore?: React.ReactNode;
    pagination?: any;
    prefixCls?: string;
    rowKey?: any;
    renderItem: any;
    size?: ListSize;
    split?: boolean;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    locale?: Object;
}
export interface ListLocale {
    emptyText: string;
}
export default class List extends React.Component<ListProps> {
    static Item: typeof Item;
    static childContextTypes: {
        grid: any;
    };
    static defaultProps: {
        dataSource: never[];
        prefixCls: string;
        bordered: boolean;
        split: boolean;
        loading: boolean;
        pagination: boolean;
    };
    private keys;
    getChildContext(): {
        grid: ListGridType | undefined;
    };
    renderItem: (item: React.ReactElement<any>, index: number) => any;
    isSomethingAfterLastTtem(): boolean;
    renderEmpty: (contextLocale: ListLocale) => JSX.Element;
    render(): JSX.Element;
}
