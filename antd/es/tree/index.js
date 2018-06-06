import _extends from 'babel-runtime/helpers/extends';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import * as React from 'react';
import RcTree, { TreeNode } from 'rc-tree';
import animation from '../_util/openAnimation';

var Tree = function (_React$Component) {
    _inherits(Tree, _React$Component);

    function Tree() {
        _classCallCheck(this, Tree);

        return _possibleConstructorReturn(this, (Tree.__proto__ || Object.getPrototypeOf(Tree)).apply(this, arguments));
    }

    _createClass(Tree, [{
        key: 'render',
        value: function render() {
            var props = this.props;
            var prefixCls = props.prefixCls,
                className = props.className;

            var checkable = props.checkable;
            return React.createElement(
                RcTree,
                _extends({}, props, { className: className, checkable: checkable ? React.createElement('span', { className: prefixCls + '-checkbox-inner' }) : checkable }),
                this.props.children
            );
        }
    }]);

    return Tree;
}(React.Component);

export default Tree;

Tree.TreeNode = TreeNode;
Tree.defaultProps = {
    prefixCls: 'ant-tree',
    checkable: false,
    showIcon: false,
    openAnimation: animation
};