/// <reference types="react" />
import * as React from 'react';
export interface ProgressProps {
    prefixCls?: string;
    className?: string;
    type?: 'line' | 'circle' | 'dashboard';
    percent?: number;
    successPercent?: number;
    format?: (percent: number) => string;
    status?: 'success' | 'active' | 'exception';
    showInfo?: boolean;
    strokeWidth?: number;
    trailColor?: string;
    width?: number;
    style?: React.CSSProperties;
    gapDegree?: number;
    gapPosition?: 'top' | 'bottom' | 'left' | 'right';
    size?: 'default' | 'small';
}
export default class Progress extends React.Component<ProgressProps, {}> {
    static Line: any;
    static Circle: any;
    static defaultProps: {
        type: string;
        percent: number;
        showInfo: boolean;
        trailColor: string;
        prefixCls: string;
        size: string;
    };
    static propTypes: {
        status: any;
        type: any;
        showInfo: any;
        percent: any;
        width: any;
        strokeWidth: any;
        trailColor: any;
        format: any;
        gapDegree: any;
        default: any;
    };
    render(): JSX.Element;
}
