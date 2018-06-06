/// <reference types="react" />
import * as React from 'react';
export interface SliderMarks {
    [key: number]: React.ReactNode | {
        style: React.CSSProperties;
        label: React.ReactNode;
    };
}
export declare type SliderValue = number | [number, number];
export declare type HandleGeneratorFn = (info: {
    value: number;
    dragging: boolean;
    index: number;
    rest: any[];
}) => React.ReactElement<any>;
export interface SliderProps {
    prefixCls?: string;
    tooltipPrefixCls?: string;
    range?: boolean;
    min?: number;
    max?: number;
    step?: number | null;
    marks?: SliderMarks;
    dots?: boolean;
    value?: SliderValue;
    defaultValue?: SliderValue;
    included?: boolean;
    disabled?: boolean;
    vertical?: boolean;
    onChange?: (value: SliderValue) => void;
    onAfterChange?: (value: SliderValue) => void;
    tipFormatter?: null | ((value: number) => React.ReactNode);
    className?: string;
    id?: string;
}
export interface SliderState {
    visibles: {
        [index: number]: boolean;
    };
}
export default class Slider extends React.Component<SliderProps, SliderState> {
    static defaultProps: {
        prefixCls: string;
        tooltipPrefixCls: string;
        tipFormatter(value: number): string;
    };
    private rcSlider;
    constructor(props: SliderProps);
    toggleTooltipVisible: (index: number, visible: boolean) => void;
    handleWithTooltip: HandleGeneratorFn;
    focus(): void;
    blur(): void;
    saveSlider: (node: any) => void;
    render(): JSX.Element;
}
