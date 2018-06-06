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
import Tooltip from '../tooltip';
import Icon from '../icon';
import Button from '../button';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';

var Popconfirm = function (_React$Component) {
    _inherits(Popconfirm, _React$Component);

    function Popconfirm(props) {
        _classCallCheck(this, Popconfirm);

        var _this = _possibleConstructorReturn(this, (Popconfirm.__proto__ || Object.getPrototypeOf(Popconfirm)).call(this, props));

        _this.onConfirm = function (e) {
            _this.setVisible(false);
            var onConfirm = _this.props.onConfirm;

            if (onConfirm) {
                onConfirm.call(_this, e);
            }
        };
        _this.onCancel = function (e) {
            _this.setVisible(false);
            var onCancel = _this.props.onCancel;

            if (onCancel) {
                onCancel.call(_this, e);
            }
        };
        _this.onVisibleChange = function (visible) {
            _this.setVisible(visible);
        };
        _this.saveTooltip = function (node) {
            _this.tooltip = node;
        };
        _this.renderOverlay = function (popconfirmLocale) {
            var _this$props = _this.props,
                prefixCls = _this$props.prefixCls,
                title = _this$props.title,
                cancelText = _this$props.cancelText,
                okText = _this$props.okText,
                okType = _this$props.okType;

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: prefixCls + '-inner-content' },
                    React.createElement(
                        'div',
                        { className: prefixCls + '-message' },
                        React.createElement(Icon, { type: 'exclamation-circle' }),
                        React.createElement(
                            'div',
                            { className: prefixCls + '-message-title' },
                            title
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: prefixCls + '-buttons' },
                        React.createElement(
                            Button,
                            { onClick: _this.onCancel, size: 'small' },
                            cancelText || popconfirmLocale.cancelText
                        ),
                        React.createElement(
                            Button,
                            { onClick: _this.onConfirm, type: okType, size: 'small' },
                            okText || popconfirmLocale.okText
                        )
                    )
                )
            );
        };
        _this.state = {
            visible: props.visible
        };
        return _this;
    }

    _createClass(Popconfirm, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if ('visible' in nextProps) {
                this.setState({ visible: nextProps.visible });
            }
        }
    }, {
        key: 'getPopupDomNode',
        value: function getPopupDomNode() {
            return this.tooltip.getPopupDomNode();
        }
    }, {
        key: 'setVisible',
        value: function setVisible(visible) {
            var props = this.props;
            if (!('visible' in props)) {
                this.setState({ visible: visible });
            }
            var onVisibleChange = props.onVisibleChange;

            if (onVisibleChange) {
                onVisibleChange(visible);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _a = this.props,
                prefixCls = _a.prefixCls,
                placement = _a.placement,
                restProps = __rest(_a, ["prefixCls", "placement"]);
            var overlay = React.createElement(
                LocaleReceiver,
                { componentName: 'Popconfirm', defaultLocale: defaultLocale.Popconfirm },
                this.renderOverlay
            );
            return React.createElement(Tooltip, _extends({}, restProps, { prefixCls: prefixCls, placement: placement, onVisibleChange: this.onVisibleChange, visible: this.state.visible, overlay: overlay, ref: this.saveTooltip }));
        }
    }]);

    return Popconfirm;
}(React.Component);

export default Popconfirm;

Popconfirm.defaultProps = {
    prefixCls: 'ant-popover',
    transitionName: 'zoom-big',
    placement: 'top',
    trigger: 'click',
    okType: 'primary'
};