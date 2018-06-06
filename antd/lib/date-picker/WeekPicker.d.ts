/// <reference types="react" />
import * as React from 'react';
import * as moment from 'moment';
export default class WeekPicker extends React.Component<any, any> {
    static defaultProps: {
        format: string;
        allowClear: boolean;
    };
    private input;
    constructor(props: any);
    componentWillReceiveProps(nextProps: any): void;
    weekDateRender: (current: any) => JSX.Element;
    handleChange: (value: moment.Moment | null) => void;
    clearSelection: (e: React.MouseEvent<HTMLElement>) => void;
    focus(): void;
    blur(): void;
    saveInput: (node: any) => void;
    render(): JSX.Element;
}
