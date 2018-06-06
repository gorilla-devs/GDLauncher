/// <reference types="react" />
import * as React from 'react';
import Group from './button-group';
export declare type ButtonType = 'primary' | 'ghost' | 'dashed' | 'danger';
export declare type ButtonShape = 'circle' | 'circle-outline';
export declare type ButtonSize = 'small' | 'default' | 'large';
export interface ButtonProps {
    type?: ButtonType;
    htmlType?: string;
    icon?: string;
    shape?: ButtonShape;
    size?: ButtonSize;
    onClick?: React.FormEventHandler<any>;
    onMouseUp?: React.FormEventHandler<any>;
    onMouseDown?: React.FormEventHandler<any>;
    onKeyPress?: React.KeyboardEventHandler<any>;
    onKeyDown?: React.KeyboardEventHandler<any>;
    tabIndex?: number;
    loading?: boolean | {
        delay?: number;
    };
    disabled?: boolean;
    style?: React.CSSProperties;
    prefixCls?: string;
    className?: string;
    ghost?: boolean;
    target?: string;
    href?: string;
    download?: string;
}
export default class Button extends React.Component<ButtonProps, any> {
    static Group: typeof Group;
    static __ANT_BUTTON: boolean;
    static defaultProps: {
        prefixCls: string;
        loading: boolean;
        ghost: boolean;
    };
    static propTypes: {
        type: any;
        shape: any;
        size: any;
        htmlType: any;
        onClick: any;
        loading: any;
        className: any;
        icon: any;
    };
    timeout: number;
    delayTimeout: number;
    constructor(props: ButtonProps);
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: ButtonProps): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    fixTwoCNChar(): void;
    handleClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    isNeedInserted(): boolean;
    render(): JSX.Element;
}
