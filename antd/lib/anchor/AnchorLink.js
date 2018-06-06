'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var AnchorLink = function (_React$Component) {
    (0, _inherits3['default'])(AnchorLink, _React$Component);

    function AnchorLink() {
        (0, _classCallCheck3['default'])(this, AnchorLink);

        var _this = (0, _possibleConstructorReturn3['default'])(this, (AnchorLink.__proto__ || Object.getPrototypeOf(AnchorLink)).apply(this, arguments));

        _this.handleClick = function () {
            _this.context.antAnchor.scrollTo(_this.props.href);
        };
        return _this;
    }

    (0, _createClass3['default'])(AnchorLink, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.context.antAnchor.registerLink(this.props.href);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.context.antAnchor.unregisterLink(this.props.href);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                prefixCls = _props.prefixCls,
                href = _props.href,
                title = _props.title,
                children = _props.children;

            var active = this.context.antAnchor.activeLink === href;
            var wrapperClassName = (0, _classnames2['default'])(prefixCls + '-link', (0, _defineProperty3['default'])({}, prefixCls + '-link-active', active));
            var titleClassName = (0, _classnames2['default'])(prefixCls + '-link-title', (0, _defineProperty3['default'])({}, prefixCls + '-link-title-active', active));
            return React.createElement(
                'div',
                { className: wrapperClassName },
                React.createElement(
                    'a',
                    { className: titleClassName, href: href, title: typeof title === 'string' ? title : '', onClick: this.handleClick },
                    title
                ),
                children
            );
        }
    }]);
    return AnchorLink;
}(React.Component);

exports['default'] = AnchorLink;

AnchorLink.defaultProps = {
    prefixCls: 'ant-anchor',
    href: '#'
};
AnchorLink.contextTypes = {
    antAnchor: _propTypes2['default'].object
};
module.exports = exports['default'];