/// <reference types="react" />
import * as React from 'react';
import { AbstractCheckboxProps } from '../checkbox/Checkbox';
import { RadioChangeEvent } from './interface';
export declare type RadioButtonProps = AbstractCheckboxProps<RadioChangeEvent>;
export default class RadioButton extends React.Component<RadioButtonProps, any> {
    static defaultProps: {
        prefixCls: string;
    };
    static contextTypes: {
        radioGroup: any;
    };
    render(): JSX.Element;
}
