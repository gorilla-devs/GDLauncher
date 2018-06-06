/// <reference types="react" />
import * as React from 'react';
import Group from './Group';
import Search from './Search';
import TextArea from './TextArea';
export interface AbstractInputProps {
    prefixCls?: string;
    className?: string;
    defaultValue?: any;
    value?: any;
    tabIndex?: number;
    style?: React.CSSProperties;
}
export interface InputProps extends AbstractInputProps {
    placeholder?: string;
    type?: string;
    id?: number | string;
    name?: string;
    size?: 'large' | 'default' | 'small';
    maxLength?: number | string;
    disabled?: boolean;
    readOnly?: boolean;
    addonBefore?: React.ReactNode;
    addonAfter?: React.ReactNode;
    onPressEnter?: React.FormEventHandler<HTMLInputElement>;
    onKeyDown?: React.FormEventHandler<HTMLInputElement>;
    onKeyUp?: React.FormEventHandler<HTMLInputElement>;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onClick?: React.FormEventHandler<HTMLInputElement>;
    onFocus?: React.FormEventHandler<HTMLInputElement>;
    onBlur?: React.FormEventHandler<HTMLInputElement>;
    autoComplete?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    spellCheck?: boolean;
    autoFocus?: boolean;
}
export default class Input extends React.Component<InputProps, any> {
    static Group: typeof Group;
    static Search: typeof Search;
    static TextArea: typeof TextArea;
    static defaultProps: {
        prefixCls: string;
        type: string;
        disabled: boolean;
    };
    static propTypes: {
        type: any;
        id: any;
        size: any;
        maxLength: any;
        disabled: any;
        value: any;
        defaultValue: any;
        className: any;
        addonBefore: any;
        addonAfter: any;
        prefixCls: any;
        autosize: any;
        onPressEnter: any;
        onKeyDown: any;
        onKeyUp: any;
        onFocus: any;
        onBlur: any;
        prefix: any;
        suffix: any;
    };
    input: HTMLInputElement;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    focus(): void;
    blur(): void;
    getInputClassName(): any;
    saveInput: (node: HTMLInputElement) => void;
    renderLabeledInput(children: React.ReactElement<any>): React.ReactElement<any>;
    renderLabeledIcon(children: React.ReactElement<any>): React.ReactElement<any>;
    renderInput(): React.ReactElement<any>;
    render(): React.ReactElement<any>;
}
