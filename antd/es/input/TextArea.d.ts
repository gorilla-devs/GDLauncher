/// <reference types="react" />
import * as React from 'react';
import { AbstractInputProps } from './Input';
export interface AutoSizeType {
    minRows?: number;
    maxRows?: number;
}
export interface TextAreaProps extends AbstractInputProps {
    autosize?: boolean | AutoSizeType;
    onPressEnter?: React.FormEventHandler<any>;
}
export interface TextAreaState {
    textareaStyles?: React.CSSProperties;
}
export declare type HTMLTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export default class TextArea extends React.Component<TextAreaProps & HTMLTextareaProps, TextAreaState> {
    static defaultProps: {
        prefixCls: string;
    };
    nextFrameActionId: number;
    state: {
        textareaStyles: {};
    };
    private textAreaRef;
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: TextAreaProps): void;
    focus(): void;
    blur(): void;
    resizeTextarea: () => void;
    getTextAreaClassName(): any;
    handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    saveTextAreaRef: (textArea: HTMLTextAreaElement) => void;
    render(): JSX.Element;
}
