/// <reference types="react" />
import * as React from 'react';
import CheckboxGroup, { CheckboxGroupContext } from './Group';
export interface AbstractCheckboxProps<T> {
    prefixCls?: string;
    className?: string;
    defaultChecked?: boolean;
    checked?: boolean;
    style?: React.CSSProperties;
    disabled?: boolean;
    onChange?: (e: T) => void;
    onMouseEnter?: React.MouseEventHandler<any>;
    onMouseLeave?: React.MouseEventHandler<any>;
    onKeyPress?: React.KeyboardEventHandler<any>;
    onKeyDown?: React.KeyboardEventHandler<any>;
    value?: any;
    tabIndex?: number;
    name?: string;
    children?: React.ReactNode;
}
export interface CheckboxProps extends AbstractCheckboxProps<CheckboxChangeEvent> {
    indeterminate?: boolean;
}
export interface CheckboxChangeEventTarget extends CheckboxProps {
    checked: boolean;
}
export interface CheckboxChangeEvent {
    target: CheckboxChangeEventTarget;
    stopPropagation: () => void;
    preventDefault: () => void;
    nativeEvent: MouseEvent;
}
export default class Checkbox extends React.Component<CheckboxProps, {}> {
    static Group: typeof CheckboxGroup;
    static defaultProps: {
        prefixCls: string;
        indeterminate: boolean;
    };
    static contextTypes: {
        checkboxGroup: any;
    };
    private rcCheckbox;
    shouldComponentUpdate(nextProps: CheckboxProps, nextState: {}, nextContext: CheckboxGroupContext): boolean;
    focus(): void;
    blur(): void;
    saveCheckbox: (node: any) => void;
    render(): JSX.Element;
}
