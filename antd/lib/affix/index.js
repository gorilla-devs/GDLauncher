"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

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

var _reactDom = require("react-dom");

var ReactDOM = _interopRequireWildcard(_reactDom);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _addEventListener = require("rc-util/lib/Dom/addEventListener");

var _addEventListener2 = _interopRequireDefault(_addEventListener);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _shallowequal = require("shallowequal");

var _shallowequal2 = _interopRequireDefault(_shallowequal);

var _omit = require("omit.js");

var _omit2 = _interopRequireDefault(_omit);

var _getScroll = require("../_util/getScroll");

var _getScroll2 = _interopRequireDefault(_getScroll);

var _throttleByAnimationFrame = require("../_util/throttleByAnimationFrame");

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

function getTargetRect(target) {
    return target !== window ? target.getBoundingClientRect() : { top: 0, left: 0, bottom: 0 };
}
function getOffset(element, target) {
    var elemRect = element.getBoundingClientRect();
    var targetRect = getTargetRect(target);
    var scrollTop = (0, _getScroll2["default"])(target, true);
    var scrollLeft = (0, _getScroll2["default"])(target, false);
    var docElem = window.document.body;
    var clientTop = docElem.clientTop || 0;
    var clientLeft = docElem.clientLeft || 0;
    return {
        top: elemRect.top - targetRect.top + scrollTop - clientTop,
        left: elemRect.left - targetRect.left + scrollLeft - clientLeft,
        width: elemRect.width,
        height: elemRect.height
    };
}
function noop() {}
function getDefaultTarget() {
    return typeof window !== 'undefined' ? window : null;
}

var Affix = function (_React$Component) {
    (0, _inherits3["default"])(Affix, _React$Component);

    function Affix() {
        (0, _classCallCheck3["default"])(this, Affix);

        var _this = (0, _possibleConstructorReturn3["default"])(this, (Affix.__proto__ || Object.getPrototypeOf(Affix)).apply(this, arguments));

        _this.events = ['resize', 'scroll', 'touchstart', 'touchmove', 'touchend', 'pageshow', 'load'];
        _this.eventHandlers = {};
        _this.state = {
            affixStyle: undefined,
            placeholderStyle: undefined
        };
        _this.saveFixedNode = function (node) {
            _this.fixedNode = node;
        };
        _this.savePlaceholderNode = function (node) {
            _this.placeholderNode = node;
        };
        return _this;
    }

    (0, _createClass3["default"])(Affix, [{
        key: "setAffixStyle",
        value: function setAffixStyle(e, affixStyle) {
            var _this2 = this;

            var _props = this.props,
                _props$onChange = _props.onChange,
                onChange = _props$onChange === undefined ? noop : _props$onChange,
                _props$target = _props.target,
                target = _props$target === undefined ? getDefaultTarget : _props$target;

            var originalAffixStyle = this.state.affixStyle;
            var isWindow = target() === window;
            if (e.type === 'scroll' && originalAffixStyle && affixStyle && isWindow) {
                return;
            }
            if ((0, _shallowequal2["default"])(affixStyle, originalAffixStyle)) {
                return;
            }
            this.setState({ affixStyle: affixStyle }, function () {
                var affixed = !!_this2.state.affixStyle;
                if (affixStyle && !originalAffixStyle || !affixStyle && originalAffixStyle) {
                    onChange(affixed);
                }
            });
        }
    }, {
        key: "setPlaceholderStyle",
        value: function setPlaceholderStyle(placeholderStyle) {
            var originalPlaceholderStyle = this.state.placeholderStyle;
            if ((0, _shallowequal2["default"])(placeholderStyle, originalPlaceholderStyle)) {
                return;
            }
            this.setState({ placeholderStyle: placeholderStyle });
        }
    }, {
        key: "syncPlaceholderStyle",
        value: function syncPlaceholderStyle(e) {
            var affixStyle = this.state.affixStyle;

            if (!affixStyle) {
                return;
            }
            this.placeholderNode.style.cssText = '';
            this.setAffixStyle(e, (0, _extends3["default"])({}, affixStyle, { width: this.placeholderNode.offsetWidth }));
            this.setPlaceholderStyle({
                width: this.placeholderNode.offsetWidth
            });
        }
    }, {
        key: "updatePosition",
        value: function updatePosition(e) {
            var _props2 = this.props,
                offsetTop = _props2.offsetTop,
                offsetBottom = _props2.offsetBottom,
                offset = _props2.offset,
                _props2$target = _props2.target,
                target = _props2$target === undefined ? getDefaultTarget : _props2$target;

            var targetNode = target();
            // Backwards support
            offsetTop = offsetTop || offset;
            var scrollTop = (0, _getScroll2["default"])(targetNode, true);
            var affixNode = ReactDOM.findDOMNode(this);
            var elemOffset = getOffset(affixNode, targetNode);
            var elemSize = {
                width: this.fixedNode.offsetWidth,
                height: this.fixedNode.offsetHeight
            };
            var offsetMode = {
                top: false,
                bottom: false
            };
            // Default to `offsetTop=0`.
            if (typeof offsetTop !== 'number' && typeof offsetBottom !== 'number') {
                offsetMode.top = true;
                offsetTop = 0;
            } else {
                offsetMode.top = typeof offsetTop === 'number';
                offsetMode.bottom = typeof offsetBottom === 'number';
            }
            var targetRect = getTargetRect(targetNode);
            var targetInnerHeight = targetNode.innerHeight || targetNode.clientHeight;
            if (scrollTop > elemOffset.top - offsetTop && offsetMode.top) {
                // Fixed Top
                var width = elemOffset.width;
                var top = targetRect.top + offsetTop;
                this.setAffixStyle(e, {
                    position: 'fixed',
                    top: top,
                    left: targetRect.left + elemOffset.left,
                    width: width
                });
                this.setPlaceholderStyle({
                    width: width,
                    height: elemSize.height
                });
            } else if (scrollTop < elemOffset.top + elemSize.height + offsetBottom - targetInnerHeight && offsetMode.bottom) {
                // Fixed Bottom
                var targetBottomOffet = targetNode === window ? 0 : window.innerHeight - targetRect.bottom;
                var _width = elemOffset.width;
                this.setAffixStyle(e, {
                    position: 'fixed',
                    bottom: targetBottomOffet + offsetBottom,
                    left: targetRect.left + elemOffset.left,
                    width: _width
                });
                this.setPlaceholderStyle({
                    width: _width,
                    height: elemOffset.height
                });
            } else {
                var affixStyle = this.state.affixStyle;

                if (e.type === 'resize' && affixStyle && affixStyle.position === 'fixed' && affixNode.offsetWidth) {
                    this.setAffixStyle(e, (0, _extends3["default"])({}, affixStyle, { width: affixNode.offsetWidth }));
                } else {
                    this.setAffixStyle(e, null);
                }
                this.setPlaceholderStyle(null);
            }
            if (e.type === 'resize') {
                this.syncPlaceholderStyle(e);
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this3 = this;

            var target = this.props.target || getDefaultTarget;
            // Wait for parent component ref has its value
            this.timeout = setTimeout(function () {
                _this3.setTargetEventListeners(target);
            });
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            if (this.props.target !== nextProps.target) {
                this.clearEventListeners();
                this.setTargetEventListeners(nextProps.target);
                // Mock Event object.
                this.updatePosition({});
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            this.clearEventListeners();
            clearTimeout(this.timeout);
            this.updatePosition.cancel();
        }
    }, {
        key: "setTargetEventListeners",
        value: function setTargetEventListeners(getTarget) {
            var _this4 = this;

            var target = getTarget();
            if (!target) {
                return;
            }
            this.clearEventListeners();
            this.events.forEach(function (eventName) {
                _this4.eventHandlers[eventName] = (0, _addEventListener2["default"])(target, eventName, _this4.updatePosition);
            });
        }
    }, {
        key: "clearEventListeners",
        value: function clearEventListeners() {
            var _this5 = this;

            this.events.forEach(function (eventName) {
                var handler = _this5.eventHandlers[eventName];
                if (handler && handler.remove) {
                    handler.remove();
                }
            });
        }
    }, {
        key: "render",
        value: function render() {
            var className = (0, _classnames2["default"])((0, _defineProperty3["default"])({}, this.props.prefixCls || 'ant-affix', this.state.affixStyle));
            var props = (0, _omit2["default"])(this.props, ['prefixCls', 'offsetTop', 'offsetBottom', 'target', 'onChange']);
            var placeholderStyle = (0, _extends3["default"])({}, this.state.placeholderStyle, this.props.style);
            return React.createElement(
                "div",
                (0, _extends3["default"])({}, props, { style: placeholderStyle, ref: this.savePlaceholderNode }),
                React.createElement(
                    "div",
                    { className: className, ref: this.saveFixedNode, style: this.state.affixStyle },
                    this.props.children
                )
            );
        }
    }]);
    return Affix;
}(React.Component);

exports["default"] = Affix;

Affix.propTypes = {
    offsetTop: _propTypes2["default"].number,
    offsetBottom: _propTypes2["default"].number,
    target: _propTypes2["default"].func
};
__decorate([(0, _throttleByAnimationFrame.throttleByAnimationFrameDecorator)()], Affix.prototype, "updatePosition", null);
module.exports = exports["default"];