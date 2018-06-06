'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _button = require('../button');

var _button2 = _interopRequireDefault(_button);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function noop() {}

var Operation = function (_React$Component) {
  (0, _inherits3['default'])(Operation, _React$Component);

  function Operation() {
    (0, _classCallCheck3['default'])(this, Operation);
    return (0, _possibleConstructorReturn3['default'])(this, (Operation.__proto__ || Object.getPrototypeOf(Operation)).apply(this, arguments));
  }

  (0, _createClass3['default'])(Operation, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          _props$moveToLeft = _props.moveToLeft,
          moveToLeft = _props$moveToLeft === undefined ? noop : _props$moveToLeft,
          _props$moveToRight = _props.moveToRight,
          moveToRight = _props$moveToRight === undefined ? noop : _props$moveToRight,
          _props$leftArrowText = _props.leftArrowText,
          leftArrowText = _props$leftArrowText === undefined ? '' : _props$leftArrowText,
          _props$rightArrowText = _props.rightArrowText,
          rightArrowText = _props$rightArrowText === undefined ? '' : _props$rightArrowText,
          leftActive = _props.leftActive,
          rightActive = _props.rightActive,
          className = _props.className;

      return React.createElement(
        'div',
        { className: className },
        React.createElement(
          _button2['default'],
          { type: 'primary', size: 'small', disabled: !leftActive, onClick: moveToLeft, icon: 'left' },
          leftArrowText
        ),
        React.createElement(
          _button2['default'],
          { type: 'primary', size: 'small', disabled: !rightActive, onClick: moveToRight, icon: 'right' },
          rightArrowText
        )
      );
    }
  }]);
  return Operation;
}(React.Component);

exports['default'] = Operation;
module.exports = exports['default'];