/// <reference types="react" />
import * as React from 'react';
import CheckableTag from './CheckableTag';
export { CheckableTagProps } from './CheckableTag';
export interface TagProps {
    prefixCls?: string;
    className?: string;
    color?: string;
    /** 标签是否可以关闭 */
    closable?: boolean;
    /** 关闭时的回调 */
    onClose?: Function;
    /** 动画关闭后的回调 */
    afterClose?: Function;
    style?: React.CSSProperties;
}
export interface TagState {
    closing: boolean;
    closed: boolean;
}
export default class Tag extends React.Component<TagProps, TagState> {
    static CheckableTag: typeof CheckableTag;
    static defaultProps: {
        prefixCls: string;
        closable: boolean;
    };
    constructor(props: TagProps);
    close: (e: React.MouseEvent<HTMLElement>) => void;
    animationEnd: (_: string, existed: boolean) => void;
    isPresetColor(color?: string): boolean;
    render(): JSX.Element;
}
