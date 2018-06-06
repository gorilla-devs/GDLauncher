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

var _Input = require('./Input');

var _Input2 = _interopRequireDefault(_Input);

var _icon = require('../icon');

var _icon2 = _interopRequireDefault(_icon);

var _button = require('../button');

var _button2 = _interopRequireDefault(_button);

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

var Search = function (_React$Component) {
    (0, _inherits3['default'])(Search, _React$Component);

    function Search() {
        (0, _classCallCheck3['default'])(this, Search);

        var _this = (0, _possibleConstructorReturn3['default'])(this, (Search.__proto__ || Object.getPrototypeOf(Search)).apply(this, arguments));

        _this.onSearch = function () {
            var onSearch = _this.props.onSearch;

            if (onSearch) {
                onSearch(_this.input.input.value);
            }
            _this.input.focus();
        };
        _this.saveInput = function (node) {
            _this.input = node;
        };
        return _this;
    }

    (0, _createClass3['default'])(Search, [{
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
        key: 'getButtonOrIcon',
        value: function getButtonOrIcon() {
            var _props = this.props,
                enterButton = _props.enterButton,
                prefixCls = _props.prefixCls,
                size = _props.size;

            if (!enterButton) {
                return React.createElement(_icon2['default'], { className: prefixCls + '-icon', type: 'search', key: 'searchIcon' });
            }
            var enterButtonAsElement = enterButton;
            if (enterButtonAsElement.type === _button2['default'] || enterButtonAsElement.type === 'button') {
                return React.cloneElement(enterButtonAsElement, enterButtonAsElement.type === _button2['default'] ? {
                    className: prefixCls + '-button',
                    size: size,
                    onClick: this.onSearch
                } : {
                    onClick: this.onSearch
                });
            }
            return React.createElement(
                _button2['default'],
                { className: prefixCls + '-button', type: 'primary', size: size, onClick: this.onSearch, key: 'enterButton' },
                enterButton === true ? React.createElement(_icon2['default'], { type: 'search' }) : enterButton
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _classNames;

            var _a = this.props,
                className = _a.className,
                prefixCls = _a.prefixCls,
                inputPrefixCls = _a.inputPrefixCls,
                size = _a.size,
                suffix = _a.suffix,
                enterButton = _a.enterButton,
                others = __rest(_a, ["className", "prefixCls", "inputPrefixCls", "size", "suffix", "enterButton"]);
            delete others.onSearch;
            var buttonOrIcon = this.getButtonOrIcon();
            var searchSuffix = suffix ? [suffix, buttonOrIcon] : buttonOrIcon;
            var inputClassName = (0, _classnames2['default'])(prefixCls, className, (_classNames = {}, (0, _defineProperty3['default'])(_classNames, prefixCls + '-enter-button', !!enterButton), (0, _defineProperty3['default'])(_classNames, prefixCls + '-' + size, !!size), _classNames));
            return React.createElement(_Input2['default'], (0, _extends3['default'])({ onPressEnter: this.onSearch }, others, { size: size, className: inputClassName, prefixCls: inputPrefixCls, suffix: searchSuffix, ref: this.saveInput }));
        }
    }]);
    return Search;
}(React.Component);

exports['default'] = Search;

Search.defaultProps = {
    inputPrefixCls: 'ant-input',
    prefixCls: 'ant-input-search',
    enterButton: false
};
module.exports = exports['default'];