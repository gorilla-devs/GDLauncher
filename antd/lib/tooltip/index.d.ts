/// <reference types="react" />
import * as React from 'react';
import { AdjustOverflow, PlacementsConfig } from './placements';
export { AdjustOverflow, PlacementsConfig };
export declare type TooltipPlacement = 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
export interface AbstractTooltipProps {
    prefixCls?: string;
    overlayClassName?: string;
    style?: React.CSSProperties;
    overlayStyle?: React.CSSProperties;
    placement?: TooltipPlacement;
    builtinPlacements?: Object;
    defaultVisible?: boolean;
    visible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    transitionName?: string;
    trigger?: 'hover' | 'focus' | 'click' | 'contextMenu';
    openClassName?: string;
    arrowPointAtCenter?: boolean;
    autoAdjustOverflow?: boolean | AdjustOverflow;
    getTooltipContainer?: (triggerNode: Element) => HTMLElement;
    getPopupContainer?: (triggerNode: Element) => HTMLElement;
    children?: React.ReactNode;
}
export declare type RenderFunction = () => React.ReactNode;
export interface TooltipProps extends AbstractTooltipProps {
    title?: React.ReactNode | RenderFunction;
    overlay?: React.ReactNode | RenderFunction;
}
export default class Tooltip extends React.Component<TooltipProps, any> {
    static defaultProps: {
        prefixCls: string;
        placement: string;
        transitionName: string;
        mouseEnterDelay: number;
        mouseLeaveDelay: number;
        arrowPointAtCenter: boolean;
        autoAdjustOverflow: boolean;
    };
    private tooltip;
    constructor(props: TooltipProps);
    componentWillReceiveProps(nextProps: TooltipProps): void;
    onVisibleChange: (visible: boolean) => void;
    getPopupDomNode(): any;
    getPlacements(): any;
    isHoverTrigger(): boolean;
    getDisabledCompatibleChildren(element: React.ReactElement<any>): React.ReactElement<any>;
    isNoTitle(): boolean;
    onPopupAlign: (domNode: HTMLElement, align: any) => void;
    saveTooltip: (node: any) => void;
    render(): JSX.Element;
}
