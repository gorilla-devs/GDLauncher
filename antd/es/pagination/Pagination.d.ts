/// <reference types="react" />
import * as React from 'react';
export interface PaginationProps {
    total?: number;
    defaultCurrent?: number;
    current?: number;
    defaultPageSize?: number;
    pageSize?: number;
    onChange?: (page: number, pageSize?: number) => void;
    hideOnSinglePage?: boolean;
    showSizeChanger?: boolean;
    pageSizeOptions?: string[];
    onShowSizeChange?: (current: number, size: number) => void;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => React.ReactNode;
    size?: string;
    simple?: boolean;
    style?: React.CSSProperties;
    locale?: Object;
    className?: string;
    prefixCls?: string;
    selectPrefixCls?: string;
    itemRender?: (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next') => React.ReactNode;
}
export declare type PaginationLocale = any;
export default class Pagination extends React.Component<PaginationProps, {}> {
    static defaultProps: {
        prefixCls: string;
        selectPrefixCls: string;
    };
    renderPagination: (locale: any) => JSX.Element;
    render(): JSX.Element;
}
