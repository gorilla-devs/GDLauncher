/// <reference types="react" />
import * as React from 'react';
import Input, { InputProps } from './Input';
export interface SearchProps extends InputProps {
    inputPrefixCls?: string;
    onSearch?: (value: string) => any;
    enterButton?: boolean | React.ReactNode;
}
export default class Search extends React.Component<SearchProps, any> {
    static defaultProps: {
        inputPrefixCls: string;
        prefixCls: string;
        enterButton: boolean;
    };
    private input;
    onSearch: () => void;
    focus(): void;
    blur(): void;
    saveInput: (node: Input) => void;
    getButtonOrIcon(): React.ReactElement<any>;
    render(): JSX.Element;
}
