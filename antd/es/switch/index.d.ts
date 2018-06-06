/// <reference types="react" />
import * as React from 'react';
export interface SwitchProps {
    prefixCls?: string;
    size?: 'small' | 'default';
    className?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => any;
    checkedChildren?: React.ReactNode;
    unCheckedChildren?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
}
export default class Switch extends React.Component<SwitchProps, {}> {
    static defaultProps: {
        prefixCls: string;
    };
    static propTypes: {
        prefixCls: any;
        size: any;
        className: any;
    };
    private rcSwitch;
    focus(): void;
    blur(): void;
    saveSwitch: (node: any) => void;
    render(): JSX.Element;
}
