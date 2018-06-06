import _extends from 'babel-runtime/helpers/extends';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import addEventListener from 'rc-util/es/Dom/addEventListener';
import Affix from '../affix';
import getScroll from '../_util/getScroll';
import getRequestAnimationFrame from '../_util/getRequestAnimationFrame';
function getDefaultContainer() {
    return window;
}
function getOffsetTop(element, container) {
    if (!element) {
        return 0;
    }
    if (!element.getClientRects().length) {
        return 0;
    }
    var rect = element.getBoundingClientRect();
    if (rect.width || rect.height) {
        if (container === window) {
            container = element.ownerDocument.documentElement;
            return rect.top - container.clientTop;
        }
        return rect.top - container.getBoundingClientRect().top;
    }
    return rect.top;
}
function easeInOutCubic(t, b, c, d) {
    var cc = c - b;
    t /= d / 2;
    if (t < 1) {
        return cc / 2 * t * t * t + b;
    }
    return cc / 2 * ((t -= 2) * t * t + 2) + b;
}
var reqAnimFrame = getRequestAnimationFrame();
var sharpMatcherRegx = /#([^#]+)$/;
function scrollTo(href) {
    var offsetTop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var getContainer = arguments[2];
    var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};

    var container = getContainer();
    var scrollTop = getScroll(container, true);
    var sharpLinkMatch = sharpMatcherRegx.exec(href);
    if (!sharpLinkMatch) {
        return;
    }
    var targetElement = document.getElementById(sharpLinkMatch[1]);
    if (!targetElement) {
        return;
    }
    var eleOffsetTop = getOffsetTop(targetElement, container);
    var targetScrollTop = scrollTop + eleOffsetTop - offsetTop;
    var startTime = Date.now();
    var frameFunc = function frameFunc() {
        var timestamp = Date.now();
        var time = timestamp - startTime;
        var nextScrollTop = easeInOutCubic(time, scrollTop, targetScrollTop, 450);
        if (container === window) {
            window.scrollTo(window.pageXOffset, nextScrollTop);
        } else {
            container.scrollTop = nextScrollTop;
        }
        if (time < 450) {
            reqAnimFrame(frameFunc);
        } else {
            callback();
        }
    };
    reqAnimFrame(frameFunc);
    history.pushState(null, '', href);
}

var Anchor = function (_React$Component) {
    _inherits(Anchor, _React$Component);

    function Anchor(props) {
        _classCallCheck(this, Anchor);

        var _this = _possibleConstructorReturn(this, (Anchor.__proto__ || Object.getPrototypeOf(Anchor)).call(this, props));

        _this.handleScroll = function () {
            if (_this.animating) {
                return;
            }
            var _this$props = _this.props,
                offsetTop = _this$props.offsetTop,
                bounds = _this$props.bounds;

            _this.setState({
                activeLink: _this.getCurrentAnchor(offsetTop, bounds)
            });
        };
        _this.handleScrollTo = function (link) {
            var _this$props2 = _this.props,
                offsetTop = _this$props2.offsetTop,
                getContainer = _this$props2.getContainer;

            _this.animating = true;
            _this.setState({ activeLink: link });
            scrollTo(link, offsetTop, getContainer, function () {
                _this.animating = false;
            });
        };
        _this.updateInk = function () {
            if (typeof document === 'undefined') {
                return;
            }
            var prefixCls = _this.props.prefixCls;

            var linkNode = ReactDOM.findDOMNode(_this).getElementsByClassName(prefixCls + '-link-title-active')[0];
            if (linkNode) {
                _this.inkNode.style.top = linkNode.offsetTop + linkNode.clientHeight / 2 - 4.5 + 'px';
            }
        };
        _this.saveInkNode = function (node) {
            _this.inkNode = node;
        };
        _this.state = {
            activeLink: null
        };
        _this.links = [];
        return _this;
    }

    _createClass(Anchor, [{
        key: 'getChildContext',
        value: function getChildContext() {
            var _this2 = this;

            return {
                antAnchor: {
                    registerLink: function registerLink(link) {
                        if (!_this2.links.includes(link)) {
                            _this2.links.push(link);
                        }
                    },
                    unregisterLink: function unregisterLink(link) {
                        var index = _this2.links.indexOf(link);
                        if (index !== -1) {
                            _this2.links.splice(index, 1);
                        }
                    },
                    activeLink: this.state.activeLink,
                    scrollTo: this.handleScrollTo
                }
            };
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var getContainer = this.props.getContainer;

            this.scrollEvent = addEventListener(getContainer(), 'scroll', this.handleScroll);
            this.handleScroll();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.scrollEvent) {
                this.scrollEvent.remove();
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.updateInk();
        }
    }, {
        key: 'getCurrentAnchor',
        value: function getCurrentAnchor() {
            var offsetTop = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var bounds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

            var activeLink = '';
            if (typeof document === 'undefined') {
                return activeLink;
            }
            var linkSections = [];
            var getContainer = this.props.getContainer;

            var container = getContainer();
            this.links.forEach(function (link) {
                var sharpLinkMatch = sharpMatcherRegx.exec(link.toString());
                if (!sharpLinkMatch) {
                    return;
                }
                var target = document.getElementById(sharpLinkMatch[1]);
                if (target) {
                    var top = getOffsetTop(target, container);
                    if (top < offsetTop + bounds) {
                        linkSections.push({
                            link: link,
                            top: top
                        });
                    }
                }
            });
            if (linkSections.length) {
                var maxSection = linkSections.reduce(function (prev, curr) {
                    return curr.top > prev.top ? curr : prev;
                });
                return maxSection.link;
            }
            return '';
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                prefixCls = _props.prefixCls,
                _props$className = _props.className,
                className = _props$className === undefined ? '' : _props$className,
                style = _props.style,
                offsetTop = _props.offsetTop,
                affix = _props.affix,
                showInkInFixed = _props.showInkInFixed,
                children = _props.children;
            var activeLink = this.state.activeLink;

            var inkClass = classNames(prefixCls + '-ink-ball', {
                visible: activeLink
            });
            var wrapperClass = classNames(className, prefixCls + '-wrapper');
            var anchorClass = classNames(prefixCls, {
                'fixed': !affix && !showInkInFixed
            });
            var wrapperStyle = _extends({ maxHeight: offsetTop ? 'calc(100vh - ' + offsetTop + 'px)' : '100vh' }, style);
            var anchorContent = React.createElement(
                'div',
                { className: wrapperClass, style: wrapperStyle },
                React.createElement(
                    'div',
                    { className: anchorClass },
                    React.createElement(
                        'div',
                        { className: prefixCls + '-ink' },
                        React.createElement('span', { className: inkClass, ref: this.saveInkNode })
                    ),
                    children
                )
            );
            return !affix ? anchorContent : React.createElement(
                Affix,
                { offsetTop: offsetTop },
                anchorContent
            );
        }
    }]);

    return Anchor;
}(React.Component);

export default Anchor;

Anchor.defaultProps = {
    prefixCls: 'ant-anchor',
    affix: true,
    showInkInFixed: false,
    getContainer: getDefaultContainer
};
Anchor.childContextTypes = {
    antAnchor: PropTypes.object
};