import _extends from 'babel-runtime/helpers/extends';
import _defineProperty from 'babel-runtime/helpers/defineProperty';
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
import PropTypes from 'prop-types';
import Animate from 'rc-animate';
import ScrollNumber from './ScrollNumber';
import classNames from 'classnames';

var Badge = function (_React$Component) {
    _inherits(Badge, _React$Component);

    function Badge() {
        _classCallCheck(this, Badge);

        return _possibleConstructorReturn(this, (Badge.__proto__ || Object.getPrototypeOf(Badge)).apply(this, arguments));
    }

    _createClass(Badge, [{
        key: 'render',
        value: function render() {
            var _classNames, _classNames2, _classNames3;

            var _a = this.props,
                count = _a.count,
                showZero = _a.showZero,
                prefixCls = _a.prefixCls,
                scrollNumberPrefixCls = _a.scrollNumberPrefixCls,
                overflowCount = _a.overflowCount,
                className = _a.className,
                style = _a.style,
                children = _a.children,
                dot = _a.dot,
                status = _a.status,
                text = _a.text,
                offset = _a.offset,
                restProps = __rest(_a, ["count", "showZero", "prefixCls", "scrollNumberPrefixCls", "overflowCount", "className", "style", "children", "dot", "status", "text", "offset"]);
            var displayCount = count > overflowCount ? overflowCount + '+' : count;
            var isZero = displayCount === '0' || displayCount === 0;
            var isDot = dot && !isZero || status;
            // dot mode don't need count
            if (isDot) {
                displayCount = '';
            }
            var isEmpty = displayCount === null || displayCount === undefined || displayCount === '';
            var hidden = (isEmpty || isZero && !showZero) && !isDot;
            var statusCls = classNames((_classNames = {}, _defineProperty(_classNames, prefixCls + '-status-dot', !!status), _defineProperty(_classNames, prefixCls + '-status-' + status, !!status), _classNames));
            var scrollNumberCls = classNames((_classNames2 = {}, _defineProperty(_classNames2, prefixCls + '-dot', isDot), _defineProperty(_classNames2, prefixCls + '-count', !isDot), _defineProperty(_classNames2, prefixCls + '-multiple-words', !isDot && count && count.toString && count.toString().length > 1), _defineProperty(_classNames2, prefixCls + '-status-' + status, !!status), _classNames2));
            var badgeCls = classNames(className, prefixCls, (_classNames3 = {}, _defineProperty(_classNames3, prefixCls + '-status', !!status), _defineProperty(_classNames3, prefixCls + '-not-a-wrapper', !children), _classNames3));
            var styleWithOffset = offset ? _extends({ marginTop: offset[0], marginLeft: offset[1] }, style) : style;
            // <Badge status="success" />
            if (!children && status) {
                return React.createElement(
                    'span',
                    { className: badgeCls, style: styleWithOffset },
                    React.createElement('span', { className: statusCls }),
                    React.createElement(
                        'span',
                        { className: prefixCls + '-status-text' },
                        text
                    )
                );
            }
            var scrollNumber = hidden ? null : React.createElement(ScrollNumber, { prefixCls: scrollNumberPrefixCls, 'data-show': !hidden, className: scrollNumberCls, count: displayCount, title: count, style: styleWithOffset });
            var statusText = hidden || !text ? null : React.createElement(
                'span',
                { className: prefixCls + '-status-text' },
                text
            );
            return React.createElement(
                'span',
                _extends({}, restProps, { className: badgeCls }),
                children,
                React.createElement(
                    Animate,
                    { component: '', showProp: 'data-show', transitionName: children ? prefixCls + '-zoom' : '', transitionAppear: true },
                    scrollNumber
                ),
                statusText
            );
        }
    }]);

    return Badge;
}(React.Component);

export default Badge;

Badge.defaultProps = {
    prefixCls: 'ant-badge',
    scrollNumberPrefixCls: 'ant-scroll-number',
    count: null,
    showZero: false,
    dot: false,
    overflowCount: 99
};
Badge.propTypes = {
    count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showZero: PropTypes.bool,
    dot: PropTypes.bool,
    overflowCount: PropTypes.number
};