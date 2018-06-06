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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _rcRate = require('rc-rate');

var _rcRate2 = _interopRequireDefault(_rcRate);

var _icon = require('../icon');

var _icon2 = _interopRequireDefault(_icon);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var Rate = function (_React$Component) {
    (0, _inherits3['default'])(Rate, _React$Component);

    function Rate() {
        (0, _classCallCheck3['default'])(this, Rate);

        var _this = (0, _possibleConstructorReturn3['default'])(this, (Rate.__proto__ || Object.getPrototypeOf(Rate)).apply(this, arguments));

        _this.saveRate = function (node) {
            _this.rcRate = node;
        };
        return _this;
    }

    (0, _createClass3['default'])(Rate, [{
        key: 'focus',
        value: function focus() {
            this.rcRate.focus();
        }
    }, {
        key: 'blur',
        value: function blur() {
            this.rcRate.blur();
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(_rcRate2['default'], (0, _extends3['default'])({ ref: this.saveRate }, this.props));
        }
    }]);
    return Rate;
}(React.Component);

exports['default'] = Rate;

Rate.propTypes = {
    prefixCls: _propTypes2['default'].string,
    character: _propTypes2['default'].node
};
Rate.defaultProps = {
    prefixCls: 'ant-rate',
    character: React.createElement(_icon2['default'], { type: 'star' })
};
module.exports = exports['default'];