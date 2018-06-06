/// <reference types="react" />
import * as React from 'react';
export declare type SpinIndicator = React.ReactElement<any>;
export interface SpinProps {
    prefixCls?: string;
    className?: string;
    spinning?: boolean;
    style?: React.CSSProperties;
    size?: 'small' | 'default' | 'large';
    tip?: string;
    delay?: number;
    wrapperClassName?: string;
    indicator?: SpinIndicator;
}
export interface SpinState {
    spinning?: boolean;
    notCssAnimationSupported?: boolean;
}
export default class Spin extends React.Component<SpinProps, SpinState> {
    static defaultProps: {
        prefixCls: string;
        spinning: boolean;
        size: string;
        wrapperClassName: string;
    };
    static propTypes: {
        prefixCls: any;
        className: any;
        spinning: any;
        size: any;
        wrapperClassName: any;
        indicator: any;
    };
    debounceTimeout: number;
    delayTimeout: number;
    constructor(props: SpinProps);
    isNestedPattern(): boolean;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentWillReceiveProps(nextProps: SpinProps): void;
    renderIndicator(): React.ReactElement<any>;
    render(): JSX.Element;
}
