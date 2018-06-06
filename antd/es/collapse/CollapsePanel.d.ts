/// <reference types="react" />
import * as React from 'react';
export interface CollapsePanelProps {
    key: string;
    header: React.ReactNode;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    showArrow?: boolean;
    prefixCls?: string;
    forceRender?: boolean;
}
export default class CollapsePanel extends React.Component<CollapsePanelProps, {}> {
    render(): JSX.Element;
}
