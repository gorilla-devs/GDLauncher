'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports['default'] = createTableRow;

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var _omit = require('omit.js');

var _omit2 = _interopRequireDefault(_omit);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function createTableRow() {
    var Component = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'tr';

    var BodyRow = function (_React$Component) {
        (0, _inherits3['default'])(BodyRow, _React$Component);

        function BodyRow(props) {
            (0, _classCallCheck3['default'])(this, BodyRow);

            var _this = (0, _possibleConstructorReturn3['default'])(this, (BodyRow.__proto__ || Object.getPrototypeOf(BodyRow)).call(this, props));

            _this.store = props.store;

            var _this$store$getState = _this.store.getState(),
                selectedRowKeys = _this$store$getState.selectedRowKeys;

            _this.state = {
                selected: selectedRowKeys.indexOf(props.rowKey) >= 0
            };
            return _this;
        }

        (0, _createClass3['default'])(BodyRow, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                this.subscribe();
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                if (this.unsubscribe) {
                    this.unsubscribe();
                }
            }
        }, {
            key: 'subscribe',
            value: function subscribe() {
                var _this2 = this;

                var _props = this.props,
                    store = _props.store,
                    rowKey = _props.rowKey;

                this.unsubscribe = store.subscribe(function () {
                    var _store$getState = _this2.store.getState(),
                        selectedRowKeys = _store$getState.selectedRowKeys;

                    var selected = selectedRowKeys.indexOf(rowKey) >= 0;
                    if (selected !== _this2.state.selected) {
                        _this2.setState({ selected: selected });
                    }
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var rowProps = (0, _omit2['default'])(this.props, ['prefixCls', 'rowKey', 'store']);
                var className = (0, _classnames3['default'])(this.props.className, (0, _defineProperty3['default'])({}, this.props.prefixCls + '-row-selected', this.state.selected));
                return React.createElement(
                    Component,
                    (0, _extends3['default'])({}, rowProps, { className: className }),
                    this.props.children
                );
            }
        }]);
        return BodyRow;
    }(React.Component);

    return BodyRow;
}
module.exports = exports['default'];