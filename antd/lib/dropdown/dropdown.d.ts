/// <reference types="react" />
import * as React from 'react';
import DropdownButton from './dropdown-button';
export interface DropDownProps {
    trigger?: ('click' | 'hover' | 'contextMenu')[];
    overlay: React.ReactNode;
    onVisibleChange?: (visible?: boolean) => void;
    visible?: boolean;
    disabled?: boolean;
    align?: Object;
    getPopupContainer?: (triggerNode: Element) => HTMLElement;
    prefixCls?: string;
    className?: string;
    transitionName?: string;
    placement?: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
    forceRender?: boolean;
}
export default class Dropdown extends React.Component<DropDownProps, any> {
    static Button: typeof DropdownButton;
    static defaultProps: {
        prefixCls: string;
        mouseEnterDelay: number;
        mouseLeaveDelay: number;
        placement: string;
    };
    getTransitionName(): string;
    componentDidMount(): void;
    render(): JSX.Element;
}
