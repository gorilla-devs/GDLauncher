/// <reference types="react" />
import * as React from 'react';
export { ScrollNumberProps } from './ScrollNumber';
export interface BadgeProps {
    /** Number to show in badge */
    count?: number | string;
    showZero?: boolean;
    /** Max count to show */
    overflowCount?: number;
    /** whether to show red dot without number */
    dot?: boolean;
    style?: React.CSSProperties;
    prefixCls?: string;
    scrollNumberPrefixCls?: string;
    className?: string;
    status?: 'success' | 'processing' | 'default' | 'error' | 'warning';
    text?: string;
    offset?: [number | string, number | string];
}
export default class Badge extends React.Component<BadgeProps, any> {
    static defaultProps: {
        prefixCls: string;
        scrollNumberPrefixCls: string;
        count: null;
        showZero: boolean;
        dot: boolean;
        overflowCount: number;
    };
    static propTypes: {
        count: any;
        showZero: any;
        dot: any;
        overflowCount: any;
    };
    render(): JSX.Element;
}
