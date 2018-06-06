"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _addEventListener = require("rc-util/lib/Dom/addEventListener");

var _addEventListener2 = _interopRequireDefault(_addEventListener);

var _omit = require("omit.js");

var _omit2 = _interopRequireDefault(_omit);

var _Grid = require("./Grid");

var _Grid2 = _interopRequireDefault(_Grid);

var _Meta = require("./Meta");

var _Meta2 = _interopRequireDefault(_Meta);

var _tabs = require("../tabs");

var _tabs2 = _interopRequireDefault(_tabs);

var _throttleByAnimationFrame = require("../_util/throttleByAnimationFrame");

var _warning = require("../_util/warning");

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if ((typeof Reflect === "undefined" ? "undefined" : (0, _typeof3["default"])(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    }return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }return t;
};

var Card = function (_React$Component) {
    (0, _inherits3["default"])(Card, _React$Component);

    function Card() {
        (0, _classCallCheck3["default"])(this, Card);

        var _this = (0, _possibleConstructorReturn3["default"])(this, (Card.__proto__ || Object.getPrototypeOf(Card)).apply(this, arguments));

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

    (0, _createClass3["default"])(Card, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.updateWiderPadding();
            this.resizeEvent = (0, _addEventListener2["default"])(window, 'resize', this.updateWiderPadding);
            if ('noHovering' in this.props) {
                (0, _warning2["default"])(!this.props.noHovering, '`noHovering` of Card is deperated, you can remove it safely or use `hoverable` instead.');
                (0, _warning2["default"])(!!this.props.noHovering, '`noHovering={false}` of Card is deperated, use `hoverable` instead.');
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
                if (element && element.type && element.type === _Grid2["default"]) {
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
            var classString = (0, _classnames2["default"])(prefixCls, className, (_classNames = {}, (0, _defineProperty3["default"])(_classNames, prefixCls + "-loading", loading), (0, _defineProperty3["default"])(_classNames, prefixCls + "-bordered", bordered), (0, _defineProperty3["default"])(_classNames, prefixCls + "-hoverable", this.getCompatibleHoverable()), (0, _defineProperty3["default"])(_classNames, prefixCls + "-wider-padding", this.state.widerPadding), (0, _defineProperty3["default"])(_classNames, prefixCls + "-padding-transition", this.updateWiderPaddingCalled), (0, _defineProperty3["default"])(_classNames, prefixCls + "-contain-grid", this.isContainGrid()), (0, _defineProperty3["default"])(_classNames, prefixCls + "-contain-tabs", tabList && tabList.length), (0, _defineProperty3["default"])(_classNames, prefixCls + "-type-" + type, !!type), _classNames));
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
            var extraProps = (0, _defineProperty3["default"])({}, hasActiveTabKey ? 'activeKey' : 'defaultActiveKey', hasActiveTabKey ? activeTabKey : defaultActiveTabKey);
            var head = void 0;
            var tabs = tabList && tabList.length ? React.createElement(
                _tabs2["default"],
                (0, _extends3["default"])({}, extraProps, { className: prefixCls + "-head-tabs", size: "large", onChange: this.onTabChange }),
                tabList.map(function (item) {
                    return React.createElement(_tabs2["default"].TabPane, { tab: item.tab, key: item.key });
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
            var divProps = (0, _omit2["default"])(others, ['onTabChange']);
            return React.createElement(
                "div",
                (0, _extends3["default"])({}, divProps, { className: classString, ref: this.saveRef }),
                head,
                coverDom,
                body,
                actionDom
            );
        }
    }]);
    return Card;
}(React.Component);

exports["default"] = Card;

Card.Grid = _Grid2["default"];
Card.Meta = _Meta2["default"];
__decorate([(0, _throttleByAnimationFrame.throttleByAnimationFrameDecorator)()], Card.prototype, "updateWiderPadding", null);
module.exports = exports["default"];