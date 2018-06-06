/// <reference types="react" />
import * as React from 'react';
import * as moment from 'moment';
export interface PickerProps {
    value?: moment.Moment;
    prefixCls: string;
}
export default function createPicker(TheCalendar: React.ComponentClass): any;
