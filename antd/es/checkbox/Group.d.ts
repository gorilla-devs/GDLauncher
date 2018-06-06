/// <reference types="react" />
import * as React from 'react';
export declare type CheckboxValueType = string | number;
export interface CheckboxOptionType {
    label: string;
    value: CheckboxValueType;
    disabled?: boolean;
}
export interface AbstractCheckboxGroupProps {
    prefixCls?: string;
    className?: string;
    options?: Array<CheckboxOptionType | string>;
    disabled?: boolean;
    style?: React.CSSProperties;
}
export interface CheckboxGroupProps extends AbstractCheckboxGroupProps {
    defaultValue?: Array<CheckboxValueType>;
    value?: Array<CheckboxValueType>;
    onChange?: (checkedValue: Array<CheckboxValueType>) => void;
}
export interface CheckboxGroupState {
    value: any;
}
export interface CheckboxGroupContext {
    checkboxGroup: {
        toggleOption: (option: CheckboxOptionType) => void;
        value: any;
        disabled: boolean;
    };
}
export default class CheckboxGroup extends React.Component<CheckboxGroupProps, CheckboxGroupState> {
    static defaultProps: {
        options: never[];
        prefixCls: string;
    };
    static propTypes: {
        defaultValue: any;
        value: any;
        options: any;
        onChange: any;
    };
    static childContextTypes: {
        checkboxGroup: any;
    };
    constructor(props: CheckboxGroupProps);
    getChildContext(): {
        checkboxGroup: {
            toggleOption: (option: CheckboxOptionType) => void;
            value: any;
            disabled: boolean | undefined;
        };
    };
    componentWillReceiveProps(nextProps: CheckboxGroupProps): void;
    shouldComponentUpdate(nextProps: CheckboxGroupProps, nextState: CheckboxGroupState): boolean;
    getOptions(): CheckboxOptionType[];
    toggleOption: (option: CheckboxOptionType) => void;
    render(): JSX.Element;
}
