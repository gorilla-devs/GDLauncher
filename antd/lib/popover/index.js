'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _tooltip = require('../tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

var _warning = require('../_util/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var Popover = function (_React$Component) {
    (0, _inherits3['default'])(Popover, _React$Component);

    function Popover() {
        (0, _classCallCheck3['default'])(this, Popover);

        var _this = (0, _possibleConstructorReturn3['default'])(this, (Popover.__proto__ || Object.getPrototypeOf(Popover)).apply(this, arguments));

        _this.saveTooltip = function (node) {
            _this.tooltip = node;
        };
        return _this;
    }

    (0, _createClass3['default'])(Popover, [{
        key: 'getPopupDomNode',
        value: function getPopupDomNode() {
            return this.tooltip.getPopupDomNode();
        }
    }, {
        key: 'getOverlay',
        value: function getOverlay() {
            var _props = this.props,
                title = _props.title,
                prefixCls = _props.prefixCls,
                content = _props.content;

            (0, _warning2['default'])(!('overlay' in this.props), 'Popover[overlay] is removed, please use Popover[content] instead, ' + 'see: https://u.ant.design/popover-content');
            return React.createElement(
                'div',
                null,
                title && React.createElement(
                    'div',
                    { className: prefixCls + '-title' },
                    title
                ),
                React.createElement(
                    'div',
                    { className: prefixCls + '-inner-content' },
                    content
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var props = (0, _extends3['default'])({}, this.props);
            delete props.title;
            return React.createElement(_tooltip2['default'], (0, _extends3['default'])({}, props, { ref: this.saveTooltip, overlay: this.getOverlay() }));
        }
    }]);
    return Popover;
}(React.Component);

exports['default'] = Popover;

Popover.defaultProps = {
    prefixCls: 'ant-popover',
    placement: 'top',
    transitionName: 'zoom-big',
    trigger: 'hover',
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    overlayStyle: {}
};
module.exports = exports['default'];