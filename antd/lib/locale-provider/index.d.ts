/// <reference types="react" />
import * as React from 'react';
import { ModalLocale } from '../modal/locale';
export interface Locale {
    locale: string;
    Pagination?: Object;
    DatePicker?: Object;
    TimePicker?: Object;
    Calendar?: Object;
    Table?: Object;
    Modal?: ModalLocale;
    Popconfirm?: Object;
    Transfer?: Object;
    Select?: Object;
    Upload?: Object;
}
export interface LocaleProviderProps {
    locale: Locale;
    children?: React.ReactElement<any>;
}
export default class LocaleProvider extends React.Component<LocaleProviderProps, any> {
    static propTypes: {
        locale: any;
    };
    static defaultProps: {
        locale: {};
    };
    static childContextTypes: {
        antLocale: any;
    };
    getChildContext(): {
        antLocale: {
            exist: boolean;
            locale: string;
            Pagination?: Object | undefined;
            DatePicker?: Object | undefined;
            TimePicker?: Object | undefined;
            Calendar?: Object | undefined;
            Table?: Object | undefined;
            Modal?: ModalLocale | undefined;
            Popconfirm?: Object | undefined;
            Transfer?: Object | undefined;
            Select?: Object | undefined;
            Upload?: Object | undefined;
        };
    };
    componentWillMount(): void;
    componentWillReceiveProps(nextProps: LocaleProviderProps): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    render(): React.ReactElement<any>;
}
