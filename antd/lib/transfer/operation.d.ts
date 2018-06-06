/// <reference types="react" />
import * as React from 'react';
export interface TransferOperationProps {
    className?: string;
    leftArrowText?: string;
    rightArrowText?: string;
    moveToLeft?: React.FormEventHandler<any>;
    moveToRight?: React.FormEventHandler<any>;
    leftActive?: boolean;
    rightActive?: boolean;
}
export default class Operation extends React.Component<TransferOperationProps, any> {
    render(): JSX.Element;
}
