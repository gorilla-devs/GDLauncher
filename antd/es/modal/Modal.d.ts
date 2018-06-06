/// <reference types="react" />
import * as React from 'react';
import { ButtonType } from '../button/button';
export interface ModalProps {
    /** 对话框是否可见*/
    visible?: boolean;
    /** 确定按钮 loading*/
    confirmLoading?: boolean;
    /** 标题*/
    title?: React.ReactNode | string;
    /** 是否显示右上角的关闭按钮*/
    closable?: boolean;
    /** 点击确定回调*/
    onOk?: (e: React.MouseEvent<any>) => void;
    /** 点击模态框右上角叉、取消按钮、Props.maskClosable 值为 true 时的遮罩层或键盘按下 Esc 时的回调*/
    onCancel?: (e: React.MouseEvent<any>) => void;
    afterClose?: () => void;
    /** 宽度*/
    width?: string | number;
    /** 底部内容*/
    footer?: React.ReactNode;
    /** 确认按钮文字*/
    okText?: string;
    /** 确认按钮类型*/
    okType?: ButtonType;
    /** 取消按钮文字*/
    cancelText?: string;
    /** 点击蒙层是否允许关闭*/
    maskClosable?: boolean;
    destroyOnClose?: boolean;
    style?: React.CSSProperties;
    wrapClassName?: string;
    maskTransitionName?: string;
    transitionName?: string;
    className?: string;
    getContainer?: (instance: React.ReactInstance) => HTMLElement;
    zIndex?: number;
    bodyStyle?: React.CSSProperties;
    maskStyle?: React.CSSProperties;
    mask?: boolean;
    keyboard?: boolean;
}
export interface ModalFuncProps {
    prefixCls?: string;
    className?: string;
    visible?: boolean;
    title?: React.ReactNode;
    content?: React.ReactNode;
    onOk?: (...args: any[]) => any | PromiseLike<any>;
    onCancel?: (...args: any[]) => any | PromiseLike<any>;
    width?: string | number;
    iconClassName?: string;
    okText?: string;
    okType?: ButtonType;
    cancelText?: string;
    iconType?: string;
    maskClosable?: boolean;
    zIndex?: number;
    okCancel?: boolean;
    style?: React.CSSProperties;
    type?: string;
    keyboard?: boolean;
}
export declare type ModalFunc = (props: ModalFuncProps) => {
    destroy: () => void;
};
export interface ModalLocale {
    okText: string;
    cancelText: string;
    justOkText: string;
}
export default class Modal extends React.Component<ModalProps, {}> {
    static info: ModalFunc;
    static success: ModalFunc;
    static error: ModalFunc;
    static warn: ModalFunc;
    static warning: ModalFunc;
    static confirm: ModalFunc;
    static defaultProps: {
        prefixCls: string;
        width: number;
        transitionName: string;
        maskTransitionName: string;
        confirmLoading: boolean;
        visible: boolean;
        okType: string;
    };
    static propTypes: {
        prefixCls: any;
        onOk: any;
        onCancel: any;
        okText: any;
        cancelText: any;
        width: any;
        confirmLoading: any;
        visible: any;
        align: any;
        footer: any;
        title: any;
        closable: any;
    };
    handleCancel: (e: React.MouseEvent<HTMLButtonElement>) => void;
    handleOk: (e: React.MouseEvent<HTMLButtonElement>) => void;
    componentDidMount(): void;
    renderFooter: (locale: ModalLocale) => JSX.Element;
    render(): JSX.Element;
}
