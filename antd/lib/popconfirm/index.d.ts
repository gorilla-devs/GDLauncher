/// <reference types="react" />
import * as React from 'react';
import { AbstractTooltipProps } from '../tooltip';
import { ButtonType } from '../button/button';
export interface PopconfirmProps extends AbstractTooltipProps {
    title: React.ReactNode;
    onConfirm?: (e: React.MouseEvent<any>) => void;
    onCancel?: (e: React.MouseEvent<any>) => void;
    okText?: React.ReactNode;
    okType?: ButtonType;
    cancelText?: React.ReactNode;
}
export interface PopconfirmState {
    visible?: boolean;
}
export interface PopconfirmLocale {
    okText: string;
    cancelText: string;
}
export default class Popconfirm extends React.Component<PopconfirmProps, PopconfirmState> {
    static defaultProps: {
        prefixCls: string;
        transitionName: string;
        placement: string;
        trigger: string;
        okType: string;
    };
    private tooltip;
    constructor(props: PopconfirmProps);
    componentWillReceiveProps(nextProps: PopconfirmProps): void;
    getPopupDomNode(): any;
    onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onCancel: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onVisibleChange: (visible: boolean) => void;
    setVisible(visible: boolean): void;
    saveTooltip: (node: any) => void;
    renderOverlay: (popconfirmLocale: PopconfirmLocale) => JSX.Element;
    render(): JSX.Element;
}
