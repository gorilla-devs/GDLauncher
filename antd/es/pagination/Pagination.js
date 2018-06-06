import _extends from 'babel-runtime/helpers/extends';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
var __rest = this && this.__rest || function (s, e) {
    var t = {};
    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }return t;
};
import * as React from 'react';
import RcPagination from 'rc-pagination';
import enUS from 'rc-pagination/es/locale/en_US';
import classNames from 'classnames';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import Select from '../select';
import MiniSelect from './MiniSelect';

var Pagination = function (_React$Component) {
    _inherits(Pagination, _React$Component);

    function Pagination() {
        _classCallCheck(this, Pagination);

        var _this = _possibleConstructorReturn(this, (Pagination.__proto__ || Object.getPrototypeOf(Pagination)).apply(this, arguments));

        _this.renderPagination = function (locale) {
            var _a = _this.props,
                className = _a.className,
                size = _a.size,
                restProps = __rest(_a, ["className", "size"]);
            var isSmall = size === 'small';
            return React.createElement(RcPagination, _extends({}, restProps, { className: classNames(className, { mini: isSmall }), selectComponentClass: isSmall ? MiniSelect : Select, locale: locale }));
        };
        return _this;
    }

    _createClass(Pagination, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                LocaleReceiver,
                { componentName: 'Pagination', defaultLocale: enUS },
                this.renderPagination
            );
        }
    }]);

    return Pagination;
}(React.Component);

export default Pagination;

Pagination.defaultProps = {
    prefixCls: 'ant-pagination',
    selectPrefixCls: 'ant-select'
};