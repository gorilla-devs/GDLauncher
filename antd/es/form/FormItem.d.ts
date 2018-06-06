/// <reference types="react" />
import * as React from 'react';
import { ColProps } from '../grid/col';
export interface FormItemProps {
    prefixCls?: string;
    className?: string;
    id?: string;
    label?: React.ReactNode;
    labelCol?: ColProps;
    wrapperCol?: ColProps;
    help?: React.ReactNode;
    extra?: React.ReactNode;
    validateStatus?: 'success' | 'warning' | 'error' | 'validating';
    hasFeedback?: boolean;
    required?: boolean;
    style?: React.CSSProperties;
    colon?: boolean;
}
export interface FormItemContext {
    vertical: boolean;
}
export default class FormItem extends React.Component<FormItemProps, any> {
    static defaultProps: {
        hasFeedback: boolean;
        prefixCls: string;
        colon: boolean;
    };
    static propTypes: {
        prefixCls: any;
        label: any;
        labelCol: any;
        help: any;
        validateStatus: any;
        hasFeedback: any;
        wrapperCol: any;
        className: any;
        id: any;
        children: any;
        colon: any;
    };
    static contextTypes: {
        vertical: any;
    };
    context: FormItemContext;
    state: {
        helpShow: boolean;
    };
    componentDidMount(): void;
    shouldComponentUpdate(...args: any[]): any;
    getHelpMsg(): any;
    getControls(children: React.ReactNode, recursively: boolean): React.ReactElement<any>[];
    getOnlyControl(): React.ReactElement<any> | null;
    getChildProp(prop: string): any;
    getId(): any;
    getMeta(): any;
    getField(): any;
    onHelpAnimEnd: (_key: string, helpShow: boolean) => void;
    renderHelp(): JSX.Element;
    renderExtra(): JSX.Element | null;
    getValidateStatus(): "error" | "" | "success" | "validating";
    renderValidateWrapper(c1: React.ReactNode, c2: React.ReactNode, c3: React.ReactNode): JSX.Element;
    renderWrapper(children: React.ReactNode): JSX.Element;
    isRequired(): any;
    onLabelClick: (e: any) => void;
    renderLabel(): JSX.Element | null;
    renderChildren(): (JSX.Element | null)[];
    renderFormItem(children: React.ReactNode): JSX.Element;
    render(): JSX.Element;
}
