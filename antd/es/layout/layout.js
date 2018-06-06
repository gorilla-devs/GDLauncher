import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
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
import PropTypes from 'prop-types';
import classNames from 'classnames';
function generator(props) {
    return function (BasicComponent) {
        return function (_React$Component) {
            _inherits(Adapter, _React$Component);

            function Adapter() {
                _classCallCheck(this, Adapter);

                return _possibleConstructorReturn(this, (Adapter.__proto__ || Object.getPrototypeOf(Adapter)).apply(this, arguments));
            }

            _createClass(Adapter, [{
                key: 'render',
                value: function render() {
                    var prefixCls = props.prefixCls;

                    return React.createElement(BasicComponent, _extends({ prefixCls: prefixCls }, this.props));
                }
            }]);

            return Adapter;
        }(React.Component);
    };
}

var Basic = function (_React$Component2) {
    _inherits(Basic, _React$Component2);

    function Basic() {
        _classCallCheck(this, Basic);

        return _possibleConstructorReturn(this, (Basic.__proto__ || Object.getPrototypeOf(Basic)).apply(this, arguments));
    }

    _createClass(Basic, [{
        key: 'render',
        value: function render() {
            var _a = this.props,
                prefixCls = _a.prefixCls,
                className = _a.className,
                children = _a.children,
                others = __rest(_a, ["prefixCls", "className", "children"]);
            var divCls = classNames(className, prefixCls);
            return React.createElement(
                'div',
                _extends({ className: divCls }, others),
                children
            );
        }
    }]);

    return Basic;
}(React.Component);

var BasicLayout = function (_React$Component3) {
    _inherits(BasicLayout, _React$Component3);

    function BasicLayout() {
        _classCallCheck(this, BasicLayout);

        var _this3 = _possibleConstructorReturn(this, (BasicLayout.__proto__ || Object.getPrototypeOf(BasicLayout)).apply(this, arguments));

        _this3.state = { siders: [] };
        return _this3;
    }

    _createClass(BasicLayout, [{
        key: 'getChildContext',
        value: function getChildContext() {
            var _this4 = this;

            return {
                siderHook: {
                    addSider: function addSider(id) {
                        _this4.setState({
                            siders: [].concat(_toConsumableArray(_this4.state.siders), [id])
                        });
                    },
                    removeSider: function removeSider(id) {
                        _this4.setState({
                            siders: _this4.state.siders.filter(function (currentId) {
                                return currentId !== id;
                            })
                        });
                    }
                }
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var _a = this.props,
                prefixCls = _a.prefixCls,
                className = _a.className,
                children = _a.children,
                hasSider = _a.hasSider,
                others = __rest(_a, ["prefixCls", "className", "children", "hasSider"]);
            var divCls = classNames(className, prefixCls, _defineProperty({}, prefixCls + '-has-sider', hasSider || this.state.siders.length > 0));
            return React.createElement(
                'div',
                _extends({ className: divCls }, others),
                children
            );
        }
    }]);

    return BasicLayout;
}(React.Component);

BasicLayout.childContextTypes = {
    siderHook: PropTypes.object
};
var Layout = generator({
    prefixCls: 'ant-layout'
})(BasicLayout);
var Header = generator({
    prefixCls: 'ant-layout-header'
})(Basic);
var Footer = generator({
    prefixCls: 'ant-layout-footer'
})(Basic);
var Content = generator({
    prefixCls: 'ant-layout-content'
})(Basic);
Layout.Header = Header;
Layout.Footer = Footer;
Layout.Content = Content;
export default Layout;