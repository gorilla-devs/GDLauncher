import _extends from 'babel-runtime/helpers/extends';
import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import * as React from 'react';
import RcCollapse from 'rc-collapse';
import classNames from 'classnames';
import animation from '../_util/openAnimation';
import CollapsePanel from './CollapsePanel';

var Collapse = function (_React$Component) {
    _inherits(Collapse, _React$Component);

    function Collapse() {
        _classCallCheck(this, Collapse);

        return _possibleConstructorReturn(this, (Collapse.__proto__ || Object.getPrototypeOf(Collapse)).apply(this, arguments));
    }

    _createClass(Collapse, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                prefixCls = _props.prefixCls,
                _props$className = _props.className,
                className = _props$className === undefined ? '' : _props$className,
                bordered = _props.bordered;

            var collapseClassName = classNames(_defineProperty({}, prefixCls + '-borderless', !bordered), className);
            return React.createElement(RcCollapse, _extends({}, this.props, { className: collapseClassName }));
        }
    }]);

    return Collapse;
}(React.Component);

export default Collapse;

Collapse.Panel = CollapsePanel;
Collapse.defaultProps = {
    prefixCls: 'ant-collapse',
    bordered: true,
    openAnimation: _extends({}, animation, {
        appear: function appear() {}
    })
};