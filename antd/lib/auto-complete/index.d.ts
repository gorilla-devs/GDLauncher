/// <reference types="react" />
import * as React from 'react';
import { AbstractSelectProps, SelectValue, OptionProps, OptGroupProps } from '../select';
export interface DataSourceItemObject {
    value: string;
    text: string;
}
export declare type DataSourceItemType = string | DataSourceItemObject;
export interface AutoCompleteInputProps {
    onChange?: React.FormEventHandler<any>;
    value: any;
}
export declare type ValidInputElement = HTMLInputElement | HTMLTextAreaElement | React.ReactElement<AutoCompleteInputProps>;
export interface AutoCompleteProps extends AbstractSelectProps {
    value?: SelectValue;
    defaultValue?: SelectValue;
    dataSource: DataSourceItemType[];
    optionLabelProp?: string;
    onChange?: (value: SelectValue) => void;
    onSelect?: (value: SelectValue, option: Object) => any;
    children?: ValidInputElement | React.ReactElement<OptionProps> | Array<React.ReactElement<OptionProps>>;
}
export default class AutoComplete extends React.Component<AutoCompleteProps, {}> {
    static Option: React.ClassicComponentClass<OptionProps>;
    static OptGroup: React.ClassicComponentClass<OptGroupProps>;
    static defaultProps: {
        prefixCls: string;
        transitionName: string;
        optionLabelProp: string;
        choiceTransitionName: string;
        showSearch: boolean;
        filterOption: boolean;
    };
    private select;
    getInputElement: () => JSX.Element;
    focus(): void;
    blur(): void;
    saveSelect: (node: any) => void;
    render(): JSX.Element;
}
