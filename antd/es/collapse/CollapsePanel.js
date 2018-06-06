import _extends from 'babel-runtime/helpers/extends';
import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import * as React from 'react';
import RcCollapse from 'rc-collapse';
import classNames from 'classnames';

var CollapsePanel = function (_React$Component) {
    _inherits(CollapsePanel, _React$Component);

    function CollapsePanel() {
        _classCallCheck(this, CollapsePanel);

        return _possibleConstructorReturn(this, (CollapsePanel.__proto__ || Object.getPrototypeOf(CollapsePanel)).apply(this, arguments));
    }

    _createClass(CollapsePanel, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                prefixCls = _props.prefixCls,
                _props$className = _props.className,
                className = _props$className === undefined ? '' : _props$className,
                _props$showArrow = _props.showArrow,
                showArrow = _props$showArrow === undefined ? true : _props$showArrow;

            var collapsePanelClassName = classNames(_defineProperty({}, prefixCls + '-no-arrow', !showArrow), className);
            return React.createElement(RcCollapse.Panel, _extends({}, this.props, { className: collapsePanelClassName }));
        }
    }]);

    return CollapsePanel;
}(React.Component);

export default CollapsePanel;