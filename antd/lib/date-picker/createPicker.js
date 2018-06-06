'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports['default'] = createPicker;

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _moment = require('moment');

var moment = _interopRequireWildcard(_moment);

var _MonthCalendar = require('rc-calendar/lib/MonthCalendar');

var _MonthCalendar2 = _interopRequireDefault(_MonthCalendar);

var _Picker = require('rc-calendar/lib/Picker');

var _Picker2 = _interopRequireDefault(_Picker);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _omit = require('omit.js');

var _omit2 = _interopRequireDefault(_omit);

var _icon = require('../icon');

var _icon2 = _interopRequireDefault(_icon);

var _warning = require('../_util/warning');

var _warning2 = _interopRequireDefault(_warning);

var _interopDefault = require('../_util/interopDefault');

var _interopDefault2 = _interopRequireDefault(_interopDefault);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function createPicker(TheCalendar) {
    return _a = function (_React$Component) {
        (0, _inherits3['default'])(CalenderWrapper, _React$Component);

        function CalenderWrapper(props) {
            (0, _classCallCheck3['default'])(this, CalenderWrapper);

            var _this = (0, _possibleConstructorReturn3['default'])(this, (CalenderWrapper.__proto__ || Object.getPrototypeOf(CalenderWrapper)).call(this, props));

            _this.renderFooter = function () {
                var _this$props = _this.props,
                    prefixCls = _this$props.prefixCls,
                    renderExtraFooter = _this$props.renderExtraFooter;

                return renderExtraFooter ? React.createElement(
                    'div',
                    { className: prefixCls + '-footer-extra' },
                    renderExtraFooter.apply(undefined, arguments)
                ) : null;
            };
            _this.clearSelection = function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this.handleChange(null);
            };
            _this.handleChange = function (value) {
                var props = _this.props;
                if (!('value' in props)) {
                    _this.setState({
                        value: value,
                        showDate: value
                    });
                }
                props.onChange(value, value && value.format(props.format) || '');
            };
            _this.handleCalendarChange = function (value) {
                _this.setState({ showDate: value });
            };
            _this.saveInput = function (node) {
                _this.input = node;
            };
            var value = props.value || props.defaultValue;
            if (value && !(0, _interopDefault2['default'])(moment).isMoment(value)) {
                throw new Error('The value/defaultValue of DatePicker or MonthPicker must be ' + 'a moment object after `antd@2.0`, see: https://u.ant.design/date-picker-value');
            }
            _this.state = {
                value: value,
                showDate: value
            };
            return _this;
        }

        (0, _createClass3['default'])(CalenderWrapper, [{
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                if ('value' in nextProps) {
                    this.setState({
                        value: nextProps.value,
                        showDate: nextProps.value
                    });
                }
            }
        }, {
            key: 'focus',
            value: function focus() {
                this.input.focus();
            }
        }, {
            key: 'blur',
            value: function blur() {
                this.input.blur();
            }
        }, {
            key: 'render',
            value: function render() {
                var _classNames,
                    _this2 = this;

                var _state = this.state,
                    value = _state.value,
                    showDate = _state.showDate;

                var props = (0, _omit2['default'])(this.props, ['onChange']);
                var prefixCls = props.prefixCls,
                    locale = props.locale,
                    localeCode = props.localeCode;

                var placeholder = 'placeholder' in props ? props.placeholder : locale.lang.placeholder;
                var disabledTime = props.showTime ? props.disabledTime : null;
                var calendarClassName = (0, _classnames2['default'])((_classNames = {}, (0, _defineProperty3['default'])(_classNames, prefixCls + '-time', props.showTime), (0, _defineProperty3['default'])(_classNames, prefixCls + '-month', _MonthCalendar2['default'] === TheCalendar), _classNames));
                if (value && localeCode) {
                    value.locale(localeCode);
                }
                var pickerProps = {};
                var calendarProps = {};
                if (props.showTime) {
                    calendarProps = {
                        // fix https://github.com/ant-design/ant-design/issues/1902
                        onSelect: this.handleChange
                    };
                } else {
                    pickerProps = {
                        onChange: this.handleChange
                    };
                }
                if ('mode' in props) {
                    calendarProps.mode = props.mode;
                }
                (0, _warning2['default'])(!('onOK' in props), 'It should be `DatePicker[onOk]` or `MonthPicker[onOk]`, instead of `onOK`!');
                var calendar = React.createElement(TheCalendar, (0, _extends3['default'])({}, calendarProps, { disabledDate: props.disabledDate, disabledTime: disabledTime, locale: locale.lang, timePicker: props.timePicker, defaultValue: props.defaultPickerValue || (0, _interopDefault2['default'])(moment)(), dateInputPlaceholder: placeholder, prefixCls: prefixCls, className: calendarClassName, onOk: props.onOk, dateRender: props.dateRender, format: props.format, showToday: props.showToday, monthCellContentRender: props.monthCellContentRender, renderFooter: this.renderFooter, onPanelChange: props.onPanelChange, onChange: this.handleCalendarChange, value: showDate }));
                var clearIcon = !props.disabled && props.allowClear && value ? React.createElement(_icon2['default'], { type: 'cross-circle', className: prefixCls + '-picker-clear', onClick: this.clearSelection }) : null;
                var input = function input(_ref) {
                    var inputValue = _ref.value;
                    return React.createElement(
                        'div',
                        null,
                        React.createElement('input', { ref: _this2.saveInput, disabled: props.disabled, readOnly: true, value: inputValue && inputValue.format(props.format) || '', placeholder: placeholder, className: props.pickerInputClass }),
                        clearIcon,
                        React.createElement('span', { className: prefixCls + '-picker-icon' })
                    );
                };
                return React.createElement(
                    'span',
                    { id: props.id, className: (0, _classnames2['default'])(props.className, props.pickerClass), style: props.style, onFocus: props.onFocus, onBlur: props.onBlur },
                    React.createElement(
                        _Picker2['default'],
                        (0, _extends3['default'])({}, props, pickerProps, { calendar: calendar, value: value, prefixCls: prefixCls + '-picker-container', style: props.popupStyle }),
                        input
                    )
                );
            }
        }]);
        return CalenderWrapper;
    }(React.Component), _a.defaultProps = {
        prefixCls: 'ant-calendar',
        allowClear: true,
        showToday: true
    }, _a;
    var _a;
}
module.exports = exports['default'];