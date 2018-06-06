/// <reference types="react" />
import * as React from 'react';
import List, { TransferListProps } from './list';
import Operation from './operation';
import Search from './search';
export { TransferListProps } from './list';
export { TransferOperationProps } from './operation';
export { TransferSearchProps } from './search';
export declare type TransferDirection = 'left' | 'right';
export interface TransferItem {
    key: string;
    title: string;
    description?: string;
    disabled?: boolean;
}
export interface TransferProps {
    prefixCls?: string;
    className?: string;
    dataSource: TransferItem[];
    targetKeys?: string[];
    selectedKeys?: string[];
    render?: (record: TransferItem) => React.ReactNode;
    onChange?: (targetKeys: string[], direction: string, moveKeys: any) => void;
    onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
    style?: React.CSSProperties;
    listStyle?: React.CSSProperties;
    titles?: string[];
    operations?: string[];
    showSearch?: boolean;
    filterOption?: (inputValue: any, item: any) => boolean;
    searchPlaceholder?: string;
    notFoundContent?: React.ReactNode;
    footer?: (props: TransferListProps) => React.ReactNode;
    body?: (props: TransferListProps) => React.ReactNode;
    rowKey?: (record: TransferItem) => string;
    onSearchChange?: (direction: TransferDirection, e: React.ChangeEvent<HTMLInputElement>) => void;
    lazy?: {} | boolean;
    onScroll?: (direction: TransferDirection, e: React.SyntheticEvent<HTMLDivElement>) => void;
}
export interface TransferLocale {
    titles: string[];
    notFoundContent: string;
    searchPlaceholder: string;
    itemUnit: string;
    itemsUnit: string;
}
export default class Transfer extends React.Component<TransferProps, any> {
    static List: typeof List;
    static Operation: typeof Operation;
    static Search: typeof Search;
    static defaultProps: {
        dataSource: never[];
        render: () => void;
        showSearch: boolean;
    };
    static propTypes: {
        prefixCls: any;
        dataSource: any;
        render: any;
        targetKeys: any;
        onChange: any;
        height: any;
        listStyle: any;
        className: any;
        titles: any;
        operations: any;
        showSearch: any;
        filterOption: any;
        searchPlaceholder: any;
        notFoundContent: any;
        body: any;
        footer: any;
        rowKey: any;
        lazy: any;
    };
    splitedDataSource: {
        leftDataSource: TransferItem[];
        rightDataSource: TransferItem[];
    } | null;
    constructor(props: TransferProps);
    componentWillReceiveProps(nextProps: TransferProps): void;
    splitDataSource(props: TransferProps): {
        leftDataSource: TransferItem[];
        rightDataSource: TransferItem[];
    };
    moveTo: (direction: "left" | "right") => void;
    moveToLeft: () => void;
    moveToRight: () => void;
    handleSelectChange(direction: TransferDirection, holder: string[]): void;
    handleSelectAll: (direction: "left" | "right", filteredDataSource: TransferItem[], checkAll: boolean) => void;
    handleLeftSelectAll: (filteredDataSource: TransferItem[], checkAll: boolean) => void;
    handleRightSelectAll: (filteredDataSource: TransferItem[], checkAll: boolean) => void;
    handleFilter: (direction: "left" | "right", e: React.ChangeEvent<HTMLInputElement>) => void;
    handleLeftFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRightFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleClear: (direction: string) => void;
    handleLeftClear: () => void;
    handleRightClear: () => void;
    handleSelect: (direction: "left" | "right", selectedItem: TransferItem, checked: boolean) => void;
    handleLeftSelect: (selectedItem: TransferItem, checked: boolean) => void;
    handleRightSelect: (selectedItem: TransferItem, checked: boolean) => void;
    handleScroll: (direction: "left" | "right", e: React.SyntheticEvent<HTMLDivElement>) => void;
    handleLeftScroll: (e: React.SyntheticEvent<HTMLDivElement>) => void;
    handleRightScroll: (e: React.SyntheticEvent<HTMLDivElement>) => void;
    getTitles(transferLocale: TransferLocale): string[];
    getSelectedKeysName(direction: TransferDirection): "sourceSelectedKeys" | "targetSelectedKeys";
    renderTransfer: (locale: TransferLocale) => JSX.Element;
    render(): JSX.Element;
}
