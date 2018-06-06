import _extends from 'babel-runtime/helpers/extends';
import CalendarLocale from 'rc-calendar/es/locale/en_US';
import TimePickerLocale from '../../time-picker/locale/en_US';
// Merge into a locale object
var locale = {
    lang: _extends({ placeholder: 'Chọn thời điểm', rangePlaceholder: ['Ngày bắt đầu', 'Ngày kết thúc'] }, CalendarLocale),
    timePickerLocale: _extends({}, TimePickerLocale)
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
export default locale;