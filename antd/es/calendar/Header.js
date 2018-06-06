import _slicedToArray from 'babel-runtime/helpers/slicedToArray';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import * as React from 'react';
import { PREFIX_CLS } from './Constants';
import Select from '../select';
import { Group, Button } from '../radio';
var Option = Select.Option;

var Header = function (_React$Component) {
    _inherits(Header, _React$Component);

    function Header() {
        _classCallCheck(this, Header);

        var _this = _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));

        _this.onYearChange = function (year) {
            var _this$props = _this.props,
                value = _this$props.value,
                validRange = _this$props.validRange;

            var newValue = value.clone();
            newValue.year(parseInt(year, 10));
            // switch the month so that it remains within range when year changes
            if (validRange) {
                var _validRange = _slicedToArray(validRange, 2),
                    start = _validRange[0],
                    end = _validRange[1];

                var newYear = newValue.get('year');
                var newMonth = newValue.get('month');
                if (newYear === end.get('year') && newMonth > end.get('month')) {
                    newValue.month(end.get('month'));
                }
                if (newYear === start.get('year') && newMonth < start.get('month')) {
                    newValue.month(start.get('month'));
                }
            }
            var onValueChange = _this.props.onValueChange;
            if (onValueChange) {
                onValueChange(newValue);
            }
        };
        _this.onMonthChange = function (month) {
            var newValue = _this.props.value.clone();
            newValue.month(parseInt(month, 10));
            var onValueChange = _this.props.onValueChange;
            if (onValueChange) {
                onValueChange(newValue);
            }
        };
        _this.onTypeChange = function (e) {
            var onTypeChange = _this.props.onTypeChange;
            if (onTypeChange) {
                onTypeChange(e.target.value);
            }
        };
        _this.getCalenderHeaderNode = function (node) {
            _this.calenderHeaderNode = node;
        };
        return _this;
    }

    _createClass(Header, [{
        key: 'getYearSelectElement',
        value: function getYearSelectElement(year) {
            var _this2 = this;

            var _props = this.props,
                yearSelectOffset = _props.yearSelectOffset,
                yearSelectTotal = _props.yearSelectTotal,
                locale = _props.locale,
                prefixCls = _props.prefixCls,
                fullscreen = _props.fullscreen,
                validRange = _props.validRange;

            var start = year - yearSelectOffset;
            var end = start + yearSelectTotal;
            if (validRange) {
                start = validRange[0].get('year');
                end = validRange[1].get('year') + 1;
            }
            var suffix = locale.year === '年' ? '年' : '';
            var options = [];
            for (var index = start; index < end; index++) {
                options.push(React.createElement(
                    Option,
                    { key: '' + index },
                    index + suffix
                ));
            }
            return React.createElement(
                Select,
                { size: fullscreen ? 'default' : 'small', dropdownMatchSelectWidth: false, className: prefixCls + '-year-select', onChange: this.onYearChange, value: String(year), getPopupContainer: function getPopupContainer() {
                        return _this2.calenderHeaderNode;
                    } },
                options
            );
        }
    }, {
        key: 'getMonthsLocale',
        value: function getMonthsLocale(value) {
            var current = value.clone();
            var localeData = value.localeData();
            var months = [];
            for (var i = 0; i < 12; i++) {
                current.month(i);
                months.push(localeData.monthsShort(current));
            }
            return months;
        }
    }, {
        key: 'getMonthSelectElement',
        value: function getMonthSelectElement(month, months) {
            var _this3 = this;

            var props = this.props;
            var prefixCls = props.prefixCls,
                fullscreen = props.fullscreen,
                validRange = props.validRange,
                value = props.value;

            var options = [];
            var start = 0;
            var end = 12;
            if (validRange) {
                var _validRange2 = _slicedToArray(validRange, 2),
                    rangeStart = _validRange2[0],
                    rangeEnd = _validRange2[1];

                var currentYear = value.get('year');
                if (rangeEnd.get('year') === currentYear) {
                    end = rangeEnd.get('month') + 1;
                } else {
                    start = rangeStart.get('month');
                }
            }
            for (var index = start; index < end; index++) {
                options.push(React.createElement(
                    Option,
                    { key: '' + index },
                    months[index]
                ));
            }
            return React.createElement(
                Select,
                { size: fullscreen ? 'default' : 'small', dropdownMatchSelectWidth: false, className: prefixCls + '-month-select', value: String(month), onChange: this.onMonthChange, getPopupContainer: function getPopupContainer() {
                        return _this3.calenderHeaderNode;
                    } },
                options
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props,
                type = _props2.type,
                value = _props2.value,
                prefixCls = _props2.prefixCls,
                locale = _props2.locale,
                fullscreen = _props2.fullscreen;

            var yearSelect = this.getYearSelectElement(value.year());
            var monthSelect = type === 'date' ? this.getMonthSelectElement(value.month(), this.getMonthsLocale(value)) : null;
            var size = fullscreen ? 'default' : 'small';
            var typeSwitch = React.createElement(
                Group,
                { onChange: this.onTypeChange, value: type, size: size },
                React.createElement(
                    Button,
                    { value: 'date' },
                    locale.month
                ),
                React.createElement(
                    Button,
                    { value: 'month' },
                    locale.year
                )
            );
            return React.createElement(
                'div',
                { className: prefixCls + '-header', ref: this.getCalenderHeaderNode },
                yearSelect,
                monthSelect,
                typeSwitch
            );
        }
    }]);

    return Header;
}(React.Component);

export default Header;

Header.defaultProps = {
    prefixCls: PREFIX_CLS + '-header',
    yearSelectOffset: 10,
    yearSelectTotal: 20
};