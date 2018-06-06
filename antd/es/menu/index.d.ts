/// <reference types="react" />
import * as React from 'react';
import SubMenu from './SubMenu';
import Item from './MenuItem';
import { SiderContext } from '../layout/Sider';
export interface SelectParam {
    key: string;
    keyPath: Array<string>;
    item: any;
    domEvent: any;
    selectedKeys: Array<string>;
}
export interface ClickParam {
    key: string;
    keyPath: Array<string>;
    item: any;
    domEvent: any;
}
export declare type MenuMode = 'vertical' | 'vertical-left' | 'vertical-right' | 'horizontal' | 'inline';
export interface MenuProps {
    id?: string;
    theme?: 'light' | 'dark';
    mode?: MenuMode;
    selectable?: boolean;
    selectedKeys?: Array<string>;
    defaultSelectedKeys?: Array<string>;
    openKeys?: Array<string>;
    defaultOpenKeys?: Array<string>;
    onOpenChange?: (openKeys: string[]) => void;
    onSelect?: (param: SelectParam) => void;
    onDeselect?: (param: SelectParam) => void;
    onClick?: (param: ClickParam) => void;
    style?: React.CSSProperties;
    openAnimation?: string | Object;
    openTransitionName?: string | Object;
    className?: string;
    prefixCls?: string;
    multiple?: boolean;
    inlineIndent?: number;
    inlineCollapsed?: boolean;
    subMenuCloseDelay?: number;
    subMenuOpenDelay?: number;
}
export interface MenuState {
    openKeys: string[];
}
export default class Menu extends React.Component<MenuProps, MenuState> {
    static Divider: any;
    static Item: typeof Item;
    static SubMenu: typeof SubMenu;
    static ItemGroup: any;
    static defaultProps: {
        prefixCls: string;
        className: string;
        theme: string;
    };
    static childContextTypes: {
        inlineCollapsed: any;
        antdMenuTheme: any;
    };
    static contextTypes: {
        siderCollapsed: any;
        collapsedWidth: any;
    };
    switchModeFromInline: boolean;
    leaveAnimationExecutedWhenInlineCollapsed: boolean;
    inlineOpenKeys: string[];
    constructor(props: MenuProps);
    getChildContext(): {
        inlineCollapsed: any;
        antdMenuTheme: "light" | "dark" | undefined;
    };
    componentWillReceiveProps(nextProps: MenuProps, nextContext: SiderContext): void;
    handleClick: (e: ClickParam) => void;
    handleOpenChange: (openKeys: string[]) => void;
    setOpenKeys(openKeys: string[]): void;
    getRealMenuMode(): "horizontal" | "vertical" | "inline" | "vertical-left" | "vertical-right" | undefined;
    getInlineCollapsed(): any;
    getMenuOpenAnimation(menuMode: MenuMode): Object | undefined;
    render(): JSX.Element | null;
}
