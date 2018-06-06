/// <reference types="react" />
import * as React from 'react';
import { ButtonGroupProps } from '../button/button-group';
import { DropDownProps } from './dropdown';
export interface DropdownButtonProps extends ButtonGroupProps, DropDownProps {
    type?: 'primary' | 'ghost' | 'dashed';
    disabled?: boolean;
    onClick?: React.MouseEventHandler<any>;
    children?: any;
}
export default class DropdownButton extends React.Component<DropdownButtonProps, any> {
    static defaultProps: {
        placement: string;
        type: string;
        prefixCls: string;
    };
    render(): JSX.Element;
}
