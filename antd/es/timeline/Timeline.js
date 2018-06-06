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
import classNames from 'classnames';
import TimelineItem from './TimelineItem';
import Icon from '../icon';

var Timeline = function (_React$Component) {
    _inherits(Timeline, _React$Component);

    function Timeline() {
        _classCallCheck(this, Timeline);

        return _possibleConstructorReturn(this, (Timeline.__proto__ || Object.getPrototypeOf(Timeline)).apply(this, arguments));
    }

    _createClass(Timeline, [{
        key: 'render',
        value: function render() {
            var _a = this.props,
                prefixCls = _a.prefixCls,
                children = _a.children,
                pending = _a.pending,
                pendingDot = _a.pendingDot,
                className = _a.className,
                restProps = __rest(_a, ["prefixCls", "children", "pending", "pendingDot", "className"]);
            var pendingNode = typeof pending === 'boolean' ? null : pending;
            var classString = classNames(prefixCls, _defineProperty({}, prefixCls + '-pending', !!pending), className);
            // Remove falsy items
            var falsylessItems = React.Children.toArray(children).filter(function (item) {
                return !!item;
            });
            var items = React.Children.map(falsylessItems, function (ele, idx) {
                return React.cloneElement(ele, {
                    last: idx === React.Children.count(falsylessItems) - 1
                });
            });
            var pendingItem = !!pending ? React.createElement(
                TimelineItem,
                { pending: !!pending, dot: pendingDot || React.createElement(Icon, { type: 'loading' }) },
                pendingNode
            ) : null;
            return React.createElement(
                'ul',
                _extends({}, restProps, { className: classString }),
                items,
                pendingItem
            );
        }
    }]);

    return Timeline;
}(React.Component);

export default Timeline;

Timeline.Item = TimelineItem;
Timeline.defaultProps = {
    prefixCls: 'ant-timeline'
};