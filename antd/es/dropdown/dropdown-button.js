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
import Button from '../button';
import Icon from '../icon';
import Dropdown from './dropdown';
import classNames from 'classnames';
var ButtonGroup = Button.Group;

var DropdownButton = function (_React$Component) {
    _inherits(DropdownButton, _React$Component);

    function DropdownButton() {
        _classCallCheck(this, DropdownButton);

        return _possibleConstructorReturn(this, (DropdownButton.__proto__ || Object.getPrototypeOf(DropdownButton)).apply(this, arguments));
    }

    _createClass(DropdownButton, [{
        key: 'render',
        value: function render() {
            var _a = this.props,
                type = _a.type,
                disabled = _a.disabled,
                onClick = _a.onClick,
                children = _a.children,
                prefixCls = _a.prefixCls,
                className = _a.className,
                overlay = _a.overlay,
                trigger = _a.trigger,
                align = _a.align,
                visible = _a.visible,
                onVisibleChange = _a.onVisibleChange,
                placement = _a.placement,
                getPopupContainer = _a.getPopupContainer,
                restProps = __rest(_a, ["type", "disabled", "onClick", "children", "prefixCls", "className", "overlay", "trigger", "align", "visible", "onVisibleChange", "placement", "getPopupContainer"]);
            var dropdownProps = {
                align: align,
                overlay: overlay,
                disabled: disabled,
                trigger: disabled ? [] : trigger,
                onVisibleChange: onVisibleChange,
                placement: placement,
                getPopupContainer: getPopupContainer
            };
            if ('visible' in this.props) {
                dropdownProps.visible = visible;
            }
            return React.createElement(
                ButtonGroup,
                _extends({}, restProps, { className: classNames(prefixCls, className) }),
                React.createElement(
                    Button,
                    { type: type, disabled: disabled, onClick: onClick },
                    children
                ),
                React.createElement(
                    Dropdown,
                    dropdownProps,
                    React.createElement(
                        Button,
                        { type: type },
                        React.createElement(Icon, { type: 'down' })
                    )
                )
            );
        }
    }]);

    return DropdownButton;
}(React.Component);

export default DropdownButton;

DropdownButton.defaultProps = {
    placement: 'bottomRight',
    type: 'default',
    prefixCls: 'ant-dropdown-button'
};