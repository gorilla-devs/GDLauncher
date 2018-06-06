/// <reference types="react" />
import * as React from 'react';
export interface StepsProps {
    prefixCls?: string;
    iconPrefix?: string;
    current?: number;
    status?: 'wait' | 'process' | 'finish' | 'error';
    size?: 'default' | 'small';
    direction?: 'horizontal' | 'vertical';
    progressDot?: boolean | Function;
    style?: React.CSSProperties;
}
export default class Steps extends React.Component<StepsProps, any> {
    static Step: any;
    static defaultProps: {
        prefixCls: string;
        iconPrefix: string;
        current: number;
    };
    static propTypes: {
        prefixCls: any;
        iconPrefix: any;
        current: any;
    };
    render(): JSX.Element;
}
