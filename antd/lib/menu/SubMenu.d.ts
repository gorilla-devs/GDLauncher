/// <reference types="react" />
import * as React from 'react';
declare class SubMenu extends React.Component<any, any> {
    static contextTypes: {
        antdMenuTheme: any;
    };
    private subMenu;
    onKeyDown: (e: React.MouseEvent<HTMLElement>) => void;
    saveSubMenu: (subMenu: any) => void;
    render(): JSX.Element;
}
export default SubMenu;
