import _extends from 'babel-runtime/helpers/extends';
import CalendarLocale from 'rc-calendar/es/locale/fa_IR';
import TimePickerLocale from '../../time-picker/locale/fa_IR';
// Merge into a locale object
var locale = {
    lang: _extends({ placeholder: 'انتخاب تاریخ', rangePlaceholder: ['تاریخ شروع', 'تاریخ پایان'] }, CalendarLocale),
    timePickerLocale: _extends({}, TimePickerLocale)
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
export default locale;