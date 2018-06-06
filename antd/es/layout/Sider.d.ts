/// <reference types="react" />
import * as React from 'react';
export declare type CollapseType = 'clickTrigger' | 'responsive';
export interface SiderProps extends React.HTMLAttributes<HTMLDivElement> {
    prefixCls?: string;
    collapsible?: boolean;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    reverseArrow?: boolean;
    onCollapse?: (collapsed: boolean, type: CollapseType) => void;
    trigger?: React.ReactNode;
    width?: number | string;
    collapsedWidth?: number | string;
    breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}
export interface SiderState {
    collapsed?: boolean;
    below: boolean;
    belowShow?: boolean;
}
export interface SiderContext {
    siderCollapsed: boolean;
}
export default class Sider extends React.Component<SiderProps, SiderState> {
    static __ANT_LAYOUT_SIDER: any;
    static defaultProps: {
        prefixCls: string;
        collapsible: boolean;
        defaultCollapsed: boolean;
        reverseArrow: boolean;
        width: number;
        collapsedWidth: number;
        style: {};
    };
    static childContextTypes: {
        siderCollapsed: any;
        collapsedWidth: any;
    };
    static contextTypes: {
        siderHook: any;
    };
    private mql;
    private uniqueId;
    constructor(props: SiderProps);
    getChildContext(): {
        siderCollapsed: boolean | undefined;
        collapsedWidth: string | number | undefined;
    };
    componentWillReceiveProps(nextProps: SiderProps): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    responsiveHandler: (mql: MediaQueryList) => void;
    setCollapsed: (collapsed: boolean, type: CollapseType) => void;
    toggle: () => void;
    belowShowChange: () => void;
    render(): JSX.Element;
}
