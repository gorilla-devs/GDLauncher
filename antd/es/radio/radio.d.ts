/// <reference types="react" />
import * as React from 'react';
import RadioGroup from './group';
import RadioButton from './radioButton';
import { RadioProps, RadioGroupContext } from './interface';
export default class Radio extends React.Component<RadioProps, {}> {
    static Group: typeof RadioGroup;
    static Button: typeof RadioButton;
    static defaultProps: {
        prefixCls: string;
        type: string;
    };
    static contextTypes: {
        radioGroup: any;
    };
    private rcCheckbox;
    shouldComponentUpdate(nextProps: RadioProps, nextState: {}, nextContext: RadioGroupContext): boolean;
    focus(): void;
    blur(): void;
    saveCheckbox: (node: any) => void;
    render(): JSX.Element;
}
