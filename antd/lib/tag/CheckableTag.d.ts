/// <reference types="react" />
import * as React from 'react';
export interface CheckableTagProps {
    prefixCls?: string;
    className?: string;
    checked: boolean;
    onChange?: (checked: boolean) => void;
}
export default class CheckableTag extends React.Component<CheckableTagProps> {
    handleClick: () => void;
    render(): JSX.Element;
}
