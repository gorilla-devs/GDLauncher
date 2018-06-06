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

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _rcInputNumber = require('rc-input-number');

var _rcInputNumber2 = _interopRequireDefault(_rcInputNumber);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }return t;
};

var InputNumber = function (_React$Component) {
    (0, _inherits3['default'])(InputNumber, _React$Component);

    function InputNumber() {
        (0, _classCallCheck3['default'])(this, InputNumber);
        return (0, _possibleConstructorReturn3['default'])(this, (InputNumber.__proto__ || Object.getPrototypeOf(InputNumber)).apply(this, arguments));
    }

    (0, _createClass3['default'])(InputNumber, [{
        key: 'render',
        value: function render() {
            var _classNames,
                _this2 = this;

            var _a = this.props,
                className = _a.className,
                size = _a.size,
                others = __rest(_a, ["className", "size"]);
            var inputNumberClass = (0, _classnames2['default'])((_classNames = {}, (0, _defineProperty3['default'])(_classNames, this.props.prefixCls + '-lg', size === 'large'), (0, _defineProperty3['default'])(_classNames, this.props.prefixCls + '-sm', size === 'small'), _classNames), className);
            return React.createElement(_rcInputNumber2['default'], (0, _extends3['default'])({ ref: function ref(c) {
                    return _this2.inputNumberRef = c;
                }, className: inputNumberClass }, others));
        }
    }, {
        key: 'focus',
        value: function focus() {
            this.inputNumberRef.focus();
        }
    }, {
        key: 'blur',
        value: function blur() {
            this.inputNumberRef.blur();
        }
    }]);
    return InputNumber;
}(React.Component);

exports['default'] = InputNumber;

InputNumber.defaultProps = {
    prefixCls: 'ant-input-number',
    step: 1
};
module.exports = exports['default'];