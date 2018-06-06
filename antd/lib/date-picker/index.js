'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _rcCalendar = require('rc-calendar');

var _rcCalendar2 = _interopRequireDefault(_rcCalendar);

var _MonthCalendar = require('rc-calendar/lib/MonthCalendar');

var _MonthCalendar2 = _interopRequireDefault(_MonthCalendar);

var _createPicker = require('./createPicker');

var _createPicker2 = _interopRequireDefault(_createPicker);

var _wrapPicker = require('./wrapPicker');

var _wrapPicker2 = _interopRequireDefault(_wrapPicker);

var _RangePicker = require('./RangePicker');

var _RangePicker2 = _interopRequireDefault(_RangePicker);

var _WeekPicker = require('./WeekPicker');

var _WeekPicker2 = _interopRequireDefault(_WeekPicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var DatePicker = (0, _wrapPicker2['default'])((0, _createPicker2['default'])(_rcCalendar2['default']));
var MonthPicker = (0, _wrapPicker2['default'])((0, _createPicker2['default'])(_MonthCalendar2['default']), 'YYYY-MM');
(0, _extends3['default'])(DatePicker, {
    RangePicker: (0, _wrapPicker2['default'])(_RangePicker2['default']),
    MonthPicker: MonthPicker,
    WeekPicker: (0, _wrapPicker2['default'])(_WeekPicker2['default'], 'gggg-wo')
});
exports['default'] = DatePicker;
module.exports = exports['default'];