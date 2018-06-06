import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

var AnchorLink = function (_React$Component) {
    _inherits(AnchorLink, _React$Component);

    function AnchorLink() {
        _classCallCheck(this, AnchorLink);

        var _this = _possibleConstructorReturn(this, (AnchorLink.__proto__ || Object.getPrototypeOf(AnchorLink)).apply(this, arguments));

        _this.handleClick = function () {
            _this.context.antAnchor.scrollTo(_this.props.href);
        };
        return _this;
    }

    _createClass(AnchorLink, [{
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
            var wrapperClassName = classNames(prefixCls + '-link', _defineProperty({}, prefixCls + '-link-active', active));
            var titleClassName = classNames(prefixCls + '-link-title', _defineProperty({}, prefixCls + '-link-title-active', active));
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

export default AnchorLink;

AnchorLink.defaultProps = {
    prefixCls: 'ant-anchor',
    href: '#'
};
AnchorLink.contextTypes = {
    antAnchor: PropTypes.object
};