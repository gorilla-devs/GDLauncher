/// <reference types="react" />
import * as React from 'react';
import { RadioGroupProps, RadioGroupState, RadioChangeEvent } from './interface';
export default class RadioGroup extends React.Component<RadioGroupProps, RadioGroupState> {
    static defaultProps: {
        disabled: boolean;
    };
    static childContextTypes: {
        radioGroup: any;
    };
    constructor(props: RadioGroupProps);
    getChildContext(): {
        radioGroup: {
            onChange: (ev: RadioChangeEvent) => void;
            value: any;
            disabled: boolean | undefined;
            name: string | undefined;
        };
    };
    componentWillReceiveProps(nextProps: RadioGroupProps): void;
    shouldComponentUpdate(nextProps: RadioGroupProps, nextState: RadioGroupState): boolean;
    onRadioChange: (ev: RadioChangeEvent) => void;
    render(): JSX.Element;
}
