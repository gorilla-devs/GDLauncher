/// <reference types="react" />
import * as React from 'react';
export interface AbstractSelectProps {
    prefixCls?: string;
    className?: string;
    size?: 'default' | 'large' | 'small';
    notFoundContent?: React.ReactNode | null;
    transitionName?: string;
    choiceTransitionName?: string;
    showSearch?: boolean;
    allowClear?: boolean;
    disabled?: boolean;
    style?: React.CSSProperties;
    tabIndex?: number;
    placeholder?: string;
    defaultActiveFirstOption?: boolean;
    dropdownClassName?: string;
    dropdownStyle?: React.CSSProperties;
    dropdownMenuStyle?: React.CSSProperties;
    onSearch?: (value: string) => any;
    filterOption?: boolean | ((inputValue: string, option: React.ReactElement<OptionProps>) => any);
}
export interface LabeledValue {
    key: string;
    label: React.ReactNode;
}
export declare type SelectValue = string | any[] | LabeledValue | LabeledValue[];
export interface SelectProps extends AbstractSelectProps {
    value?: SelectValue;
    defaultValue?: SelectValue;
    mode?: 'default' | 'multiple' | 'tags' | 'combobox';
    optionLabelProp?: string;
    onChange?: (value: SelectValue, option: React.ReactElement<any> | React.ReactElement<any>[]) => void;
    onSelect?: (value: SelectValue, option: React.ReactElement<any>) => any;
    onDeselect?: (value: SelectValue) => any;
    onBlur?: () => any;
    onFocus?: () => any;
    onPopupScroll?: () => any;
    onInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    maxTagCount?: number;
    maxTagPlaceholder?: React.ReactNode | ((omittedValues: SelectValue[]) => React.ReactNode);
    dropdownMatchSelectWidth?: boolean;
    optionFilterProp?: string;
    labelInValue?: boolean;
    getPopupContainer?: (triggerNode: Element) => HTMLElement;
    tokenSeparators?: string[];
    getInputElement?: () => React.ReactElement<any>;
    autoFocus?: boolean;
}
export interface OptionProps {
    disabled?: boolean;
    value?: any;
    title?: string;
    children?: React.ReactNode;
}
export interface OptGroupProps {
    label?: React.ReactNode;
}
export interface SelectLocale {
    notFoundContent?: string;
}
export default class Select extends React.Component<SelectProps, {}> {
    static Option: React.ClassicComponentClass<OptionProps>;
    static OptGroup: React.ClassicComponentClass<OptGroupProps>;
    static defaultProps: {
        prefixCls: string;
        showSearch: boolean;
        transitionName: string;
        choiceTransitionName: string;
    };
    static propTypes: {
        prefixCls: any;
        className: any;
        size: any;
        combobox: any;
        notFoundContent: any;
        showSearch: any;
        optionLabelProp: any;
        transitionName: any;
        choiceTransitionName: any;
    };
    private rcSelect;
    focus(): void;
    blur(): void;
    saveSelect: (node: any) => void;
    getNotFoundContent(locale: SelectLocale): {} | null | undefined;
    renderSelect: (locale: SelectLocale) => JSX.Element;
    render(): JSX.Element;
}
