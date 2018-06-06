import _extends from "babel-runtime/helpers/extends";
import _defineProperty from "babel-runtime/helpers/defineProperty";
import _classCallCheck from "babel-runtime/helpers/classCallCheck";
import _createClass from "babel-runtime/helpers/createClass";
import _possibleConstructorReturn from "babel-runtime/helpers/possibleConstructorReturn";
import _inherits from "babel-runtime/helpers/inherits";
import _typeof from "babel-runtime/helpers/typeof";
var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    }return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
import addEventListener from "rc-util/es/Dom/addEventListener";
import omit from 'omit.js';
import Grid from './Grid';
import Meta from './Meta';
import Tabs from '../tabs';
import { throttleByAnimationFrameDecorator } from '../_util/throttleByAnimationFrame';
import warning from '../_util/warning';

var Card = function (_React$Component) {
    _inherits(Card, _React$Component);

    function Card() {
        _classCallCheck(this, Card);

        var _this = _possibleConstructorReturn(this, (Card.__proto__ || Object.getPrototypeOf(Card)).apply(this, arguments));

        _this.state = {
            widerPadding: false
        };
        _this.onTabChange = function (key) {
            if (_this.props.onTabChange) {
                _this.props.onTabChange(key);
            }
        };
        _this.saveRef = function (node) {
            _this.container = node;
        };
        return _this;
    }

    _createClass(Card, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.updateWiderPadding();
            this.resizeEvent = addEventListener(window, 'resize', this.updateWiderPadding);
            if ('noHovering' in this.props) {
                warning(!this.props.noHovering, '`noHovering` of Card is deperated, you can remove it safely or use `hoverable` instead.');
                warning(!!this.props.noHovering, '`noHovering={false}` of Card is deperated, use `hoverable` instead.');
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            if (this.resizeEvent) {
                this.resizeEvent.remove();
            }
            this.updateWiderPadding.cancel();
        }
    }, {
        key: "updateWiderPadding",
        value: function updateWiderPadding() {
            var _this2 = this;

            if (!this.container) {
                return;
            }
            // 936 is a magic card width pixer number indicated by designer
            var WIDTH_BOUDARY_PX = 936;
            if (this.container.offsetWidth >= WIDTH_BOUDARY_PX && !this.state.widerPadding) {
                this.setState({ widerPadding: true }, function () {
                    _this2.updateWiderPaddingCalled = true; // first render without css transition
                });
            }
            if (this.container.offsetWidth < WIDTH_BOUDARY_PX && this.state.widerPadding) {
                this.setState({ widerPadding: false }, function () {
                    _this2.updateWiderPaddingCalled = true; // first render without css transition
                });
            }
        }
    }, {
        key: "isContainGrid",
        value: function isContainGrid() {
            var containGrid = void 0;
            React.Children.forEach(this.props.children, function (element) {
                if (element && element.type && element.type === Grid) {
                    containGrid = true;
                }
            });
            return containGrid;
        }
    }, {
        key: "getAction",
        value: function getAction(actions) {
            if (!actions || !actions.length) {
                return null;
            }
            var actionList = actions.map(function (action, index) {
                return React.createElement(
                    "li",
                    { style: { width: 100 / actions.length + "%" }, key: "action-" + index },
                    React.createElement(
                        "span",
                        null,
                        action
                    )
                );
            });
            return actionList;
        }
        // For 2.x compatible

    }, {
        key: "getCompatibleHoverable",
        value: function getCompatibleHoverable() {
            var _props = this.props,
                noHovering = _props.noHovering,
                hoverable = _props.hoverable;

            if ('noHovering' in this.props) {
                return !noHovering || hoverable;
            }
            return !!hoverable;
        }
    }, {
        key: "render",
        value: function render() {
            var _classNames;

            var _a = this.props,
                _a$prefixCls = _a.prefixCls,
                prefixCls = _a$prefixCls === undefined ? 'ant-card' : _a$prefixCls,
                className = _a.className,
                extra = _a.extra,
                bodyStyle = _a.bodyStyle,
                noHovering = _a.noHovering,
                hoverable = _a.hoverable,
                title = _a.title,
                loading = _a.loading,
                _a$bordered = _a.bordered,
                bordered = _a$bordered === undefined ? true : _a$bordered,
                type = _a.type,
                cover = _a.cover,
                actions = _a.actions,
                tabList = _a.tabList,
                children = _a.children,
                activeTabKey = _a.activeTabKey,
                defaultActiveTabKey = _a.defaultActiveTabKey,
                others = __rest(_a, ["prefixCls", "className", "extra", "bodyStyle", "noHovering", "hoverable", "title", "loading", "bordered", "type", "cover", "actions", "tabList", "children", "activeTabKey", "defaultActiveTabKey"]);
            var classString = classNames(prefixCls, className, (_classNames = {}, _defineProperty(_classNames, prefixCls + "-loading", loading), _defineProperty(_classNames, prefixCls + "-bordered", bordered), _defineProperty(_classNames, prefixCls + "-hoverable", this.getCompatibleHoverable()), _defineProperty(_classNames, prefixCls + "-wider-padding", this.state.widerPadding), _defineProperty(_classNames, prefixCls + "-padding-transition", this.updateWiderPaddingCalled), _defineProperty(_classNames, prefixCls + "-contain-grid", this.isContainGrid()), _defineProperty(_classNames, prefixCls + "-contain-tabs", tabList && tabList.length), _defineProperty(_classNames, prefixCls + "-type-" + type, !!type), _classNames));
            var loadingBlock = React.createElement(
                "div",
                { className: prefixCls + "-loading-content" },
                React.createElement("p", { className: prefixCls + "-loading-block", style: { width: '94%' } }),
                React.createElement(
                    "p",
                    null,
                    React.createElement("span", { className: prefixCls + "-loading-block", style: { width: '28%' } }),
                    React.createElement("span", { className: prefixCls + "-loading-block", style: { width: '62%' } })
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement("span", { className: prefixCls + "-loading-block", style: { width: '22%' } }),
                    React.createElement("span", { className: prefixCls + "-loading-block", style: { width: '66%' } })
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement("span", { className: prefixCls + "-loading-block", style: { width: '56%' } }),
                    React.createElement("span", { className: prefixCls + "-loading-block", style: { width: '39%' } })
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement("span", { className: prefixCls + "-loading-block", style: { width: '21%' } }),
                    React.createElement("span", { className: prefixCls + "-loading-block", style: { width: '15%' } }),
                    React.createElement("span", { className: prefixCls + "-loading-block", style: { width: '40%' } })
                )
            );
            var hasActiveTabKey = activeTabKey !== undefined;
            var extraProps = _defineProperty({}, hasActiveTabKey ? 'activeKey' : 'defaultActiveKey', hasActiveTabKey ? activeTabKey : defaultActiveTabKey);
            var head = void 0;
            var tabs = tabList && tabList.length ? React.createElement(
                Tabs,
                _extends({}, extraProps, { className: prefixCls + "-head-tabs", size: "large", onChange: this.onTabChange }),
                tabList.map(function (item) {
                    return React.createElement(Tabs.TabPane, { tab: item.tab, key: item.key });
                })
            ) : null;
            if (title || extra || tabs) {
                head = React.createElement(
                    "div",
                    { className: prefixCls + "-head" },
                    React.createElement(
                        "div",
                        { className: prefixCls + "-head-wrapper" },
                        title && React.createElement(
                            "div",
                            { className: prefixCls + "-head-title" },
                            title
                        ),
                        extra && React.createElement(
                            "div",
                            { className: prefixCls + "-extra" },
                            extra
                        )
                    ),
                    tabs
                );
            }
            var coverDom = cover ? React.createElement(
                "div",
                { className: prefixCls + "-cover" },
                cover
            ) : null;
            var body = React.createElement(
                "div",
                { className: prefixCls + "-body", style: bodyStyle },
                loading ? loadingBlock : children
            );
            var actionDom = actions && actions.length ? React.createElement(
                "ul",
                { className: prefixCls + "-actions" },
                this.getAction(actions)
            ) : null;
            var divProps = omit(others, ['onTabChange']);
            return React.createElement(
                "div",
                _extends({}, divProps, { className: classString, ref: this.saveRef }),
                head,
                coverDom,
                body,
                actionDom
            );
        }
    }]);

    return Card;
}(React.Component);

export default Card;

Card.Grid = Grid;
Card.Meta = Meta;
__decorate([throttleByAnimationFrameDecorator()], Card.prototype, "updateWiderPadding", null);