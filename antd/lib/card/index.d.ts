/// <reference types="react" />
import * as React from 'react';
import Grid from './Grid';
import Meta from './Meta';
export { CardGridProps } from './Grid';
export { CardMetaProps } from './Meta';
export declare type CardType = 'inner';
export interface CardTabListType {
    key: string;
    tab: React.ReactNode;
}
export interface CardProps {
    prefixCls?: string;
    title?: React.ReactNode;
    extra?: React.ReactNode;
    bordered?: boolean;
    bodyStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    loading?: boolean;
    noHovering?: boolean;
    hoverable?: boolean;
    children?: React.ReactNode;
    id?: string;
    className?: string;
    type?: CardType;
    cover?: React.ReactNode;
    actions?: Array<React.ReactNode>;
    tabList?: CardTabListType[];
    onTabChange?: (key: string) => void;
    activeTabKey?: string;
    defaultActiveTabKey?: string;
}
export default class Card extends React.Component<CardProps, {}> {
    static Grid: typeof Grid;
    static Meta: typeof Meta;
    resizeEvent: any;
    updateWiderPaddingCalled: boolean;
    state: {
        widerPadding: boolean;
    };
    private container;
    componentDidMount(): void;
    componentWillUnmount(): void;
    updateWiderPadding(): void;
    onTabChange: (key: string) => void;
    saveRef: (node: HTMLDivElement) => void;
    isContainGrid(): undefined;
    getAction(actions: React.ReactNode[]): JSX.Element[] | null;
    getCompatibleHoverable(): boolean | undefined;
    render(): JSX.Element;
}
