/// <reference types="react" />
import * as React from 'react';
import { AbstractTooltipProps } from '../tooltip';
export interface PopoverProps extends AbstractTooltipProps {
    title?: React.ReactNode;
    content?: React.ReactNode;
}
export default class Popover extends React.Component<PopoverProps, {}> {
    static defaultProps: {
        prefixCls: string;
        placement: string;
        transitionName: string;
        trigger: string;
        mouseEnterDelay: number;
        mouseLeaveDelay: number;
        overlayStyle: {};
    };
    private tooltip;
    getPopupDomNode(): any;
    getOverlay(): JSX.Element;
    saveTooltip: (node: any) => void;
    render(): JSX.Element;
}
