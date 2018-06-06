/// <reference types="react" />
import * as React from 'react';
export interface RateProps {
    prefixCls?: string;
    count?: number;
    value?: number;
    defaultValue?: number;
    allowHalf?: boolean;
    allowClear?: boolean;
    disabled?: boolean;
    onChange?: (value: number) => any;
    onHoverChange?: (value: number) => any;
    character?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}
export default class Rate extends React.Component<RateProps, any> {
    static propTypes: {
        prefixCls: any;
        character: any;
    };
    static defaultProps: {
        prefixCls: string;
        character: JSX.Element;
    };
    private rcRate;
    focus(): void;
    blur(): void;
    saveRate: (node: any) => void;
    render(): JSX.Element;
}
