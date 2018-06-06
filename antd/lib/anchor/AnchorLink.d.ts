/// <reference types="react" />
import * as React from 'react';
export interface AnchorLinkProps {
    prefixCls?: string;
    href: string;
    title: React.ReactNode;
    children?: any;
}
export default class AnchorLink extends React.Component<AnchorLinkProps, any> {
    static defaultProps: {
        prefixCls: string;
        href: string;
    };
    static contextTypes: {
        antAnchor: any;
    };
    context: {
        antAnchor: any;
    };
    componentDidMount(): void;
    componentWillUnmount(): void;
    handleClick: () => void;
    render(): JSX.Element;
}
