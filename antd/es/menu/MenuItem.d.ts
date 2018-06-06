/// <reference types="react" />
import * as React from 'react';
declare class MenuItem extends React.Component<any, any> {
    static contextTypes: {
        inlineCollapsed: any;
    };
    static isMenuItem: number;
    private menuItem;
    onKeyDown: (e: React.MouseEvent<HTMLElement>) => void;
    saveMenuItem: (menuItem: any) => void;
    render(): JSX.Element;
}
export default MenuItem;
