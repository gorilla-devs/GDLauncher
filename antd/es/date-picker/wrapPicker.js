import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _extends from 'babel-runtime/helpers/extends';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import * as React from 'react';
import TimePickerPanel from 'rc-time-picker/es/Panel';
import classNames from 'classnames';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { generateShowHourMinuteSecond } from '../time-picker';
import enUS from './locale/en_US';
function getColumns(_ref) {
    var showHour = _ref.showHour,
        showMinute = _ref.showMinute,
        showSecond = _ref.showSecond,
        use12Hours = _ref.use12Hours;

    var column = 0;
    if (showHour) {
        column += 1;
    }
    if (showMinute) {
        column += 1;
    }
    if (showSecond) {
        column += 1;
    }
    if (use12Hours) {
        column += 1;
    }
    return column;
}
export default function wrapPicker(Picker, defaultFormat) {
    return _a = function (_React$Component) {
        _inherits(PickerWrapper, _React$Component);

        function PickerWrapper() {
            _classCallCheck(this, PickerWrapper);

            var _this = _possibleConstructorReturn(this, (PickerWrapper.__proto__ || Object.getPrototypeOf(PickerWrapper)).apply(this, arguments));

            _this.handleOpenChange = function (open) {
                var onOpenChange = _this.props.onOpenChange;

                onOpenChange(open);
            };
            _this.handleFocus = function (e) {
                var onFocus = _this.props.onFocus;

                if (onFocus) {
                    onFocus(e);
                }
            };
            _this.handleBlur = function (e) {
                var onBlur = _this.props.onBlur;

                if (onBlur) {
                    onBlur(e);
                }
            };
            _this.savePicker = function (node) {
                _this.picker = node;
            };
            _this.getDefaultLocale = function () {
                var result = _extends({}, enUS, _this.props.locale);
                result.lang = _extends({}, result.lang, (_this.props.locale || {}).lang);
                return result;
            };
            _this.renderPicker = function (locale, localeCode) {
                var _classNames2;

                var props = _this.props;
                var prefixCls = props.prefixCls,
                    inputPrefixCls = props.inputPrefixCls;

                var pickerClass = classNames(prefixCls + '-picker', _defineProperty({}, prefixCls + '-picker-' + props.size, !!props.size));
                var pickerInputClass = classNames(prefixCls + '-picker-input', inputPrefixCls, (_classNames2 = {}, _defineProperty(_classNames2, inputPrefixCls + '-lg', props.size === 'large'), _defineProperty(_classNames2, inputPrefixCls + '-sm', props.size === 'small'), _defineProperty(_classNames2, inputPrefixCls + '-disabled', props.disabled), _classNames2));
                var timeFormat = props.showTime && props.showTime.format || 'HH:mm:ss';
                var rcTimePickerProps = _extends({}, generateShowHourMinuteSecond(timeFormat), { format: timeFormat, use12Hours: props.showTime && props.showTime.use12Hours });
                var columns = getColumns(rcTimePickerProps);
                var timePickerCls = prefixCls + '-time-picker-column-' + columns;
                var timePicker = props.showTime ? React.createElement(TimePickerPanel, _extends({}, rcTimePickerProps, props.showTime, { prefixCls: prefixCls + '-time-picker', className: timePickerCls, placeholder: locale.timePickerLocale.placeholder, transitionName: 'slide-up' })) : null;
                return React.createElement(Picker, _extends({}, props, { ref: _this.savePicker, pickerClass: pickerClass, pickerInputClass: pickerInputClass, locale: locale, localeCode: localeCode, timePicker: timePicker, onOpenChange: _this.handleOpenChange, onFocus: _this.handleFocus, onBlur: _this.handleBlur }));
            };
            return _this;
        }

        _createClass(PickerWrapper, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _props = this.props,
                    autoFocus = _props.autoFocus,
                    disabled = _props.disabled;

                if (autoFocus && !disabled) {
                    this.focus();
                }
            }
        }, {
            key: 'focus',
            value: function focus() {
                this.picker.focus();
            }
        }, {
            key: 'blur',
            value: function blur() {
                this.picker.blur();
            }
        }, {
            key: 'render',
            value: function render() {
                return React.createElement(
                    LocaleReceiver,
                    { componentName: 'DatePicker', defaultLocale: this.getDefaultLocale },
                    this.renderPicker
                );
            }
        }]);

        return PickerWrapper;
    }(React.Component), _a.defaultProps = {
        format: defaultFormat || 'YYYY-MM-DD',
        transitionName: 'slide-up',
        popupStyle: {},
        onChange: function onChange() {},
        onOk: function onOk() {},
        onOpenChange: function onOpenChange() {},

        locale: {},
        prefixCls: 'ant-calendar',
        inputPrefixCls: 'ant-input'
    }, _a;
    var _a;
}