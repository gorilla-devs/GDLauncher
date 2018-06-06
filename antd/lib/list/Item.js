'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Meta = undefined;

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

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _grid = require('../grid');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }return t;
};
var Meta = exports.Meta = function Meta(props) {
    var _props$prefixCls = props.prefixCls,
        prefixCls = _props$prefixCls === undefined ? 'ant-list' : _props$prefixCls,
        className = props.className,
        avatar = props.avatar,
        title = props.title,
        description = props.description,
        others = __rest(props, ["prefixCls", "className", "avatar", "title", "description"]);

    var classString = (0, _classnames2['default'])(prefixCls + '-item-meta', className);
    var content = React.createElement(
        'div',
        { className: prefixCls + '-item-meta-content' },
        title && React.createElement(
            'h4',
            { className: prefixCls + '-item-meta-title' },
            title
        ),
        description && React.createElement(
            'div',
            { className: prefixCls + '-item-meta-description' },
            description
        )
    );
    return React.createElement(
        'div',
        (0, _extends3['default'])({}, others, { className: classString }),
        avatar && React.createElement(
            'div',
            { className: prefixCls + '-item-meta-avatar' },
            avatar
        ),
        (title || description) && content
    );
};
function getGrid(grid, t) {
    return grid[t] && Math.floor(24 / grid[t]);
}
var GridColumns = ['', 1, 2, 3, 4, 6, 8, 12, 24];

var Item = function (_React$Component) {
    (0, _inherits3['default'])(Item, _React$Component);

    function Item() {
        (0, _classCallCheck3['default'])(this, Item);
        return (0, _possibleConstructorReturn3['default'])(this, (Item.__proto__ || Object.getPrototypeOf(Item)).apply(this, arguments));
    }

    (0, _createClass3['default'])(Item, [{
        key: 'render',
        value: function render() {
            var grid = this.context.grid;
            var _a = this.props,
                _a$prefixCls = _a.prefixCls,
                prefixCls = _a$prefixCls === undefined ? 'ant-list' : _a$prefixCls,
                children = _a.children,
                actions = _a.actions,
                extra = _a.extra,
                className = _a.className,
                others = __rest(_a, ["prefixCls", "children", "actions", "extra", "className"]);
            var classString = (0, _classnames2['default'])(prefixCls + '-item', className);
            var metaContent = [];
            var otherContent = [];
            React.Children.forEach(children, function (element) {
                if (element && element.type && element.type === Meta) {
                    metaContent.push(element);
                } else {
                    otherContent.push(element);
                }
            });
            var contentClassString = (0, _classnames2['default'])(prefixCls + '-item-content', (0, _defineProperty3['default'])({}, prefixCls + '-item-content-single', metaContent.length < 1));
            var content = otherContent.length > 0 ? React.createElement(
                'div',
                { className: contentClassString },
                otherContent
            ) : null;
            var actionsContent = void 0;
            if (actions && actions.length > 0) {
                var actionsContentItem = function actionsContentItem(action, i) {
                    return React.createElement(
                        'li',
                        { key: prefixCls + '-item-action-' + i },
                        action,
                        i !== actions.length - 1 && React.createElement('em', { className: prefixCls + '-item-action-split' })
                    );
                };
                actionsContent = React.createElement(
                    'ul',
                    { className: prefixCls + '-item-action' },
                    actions.map(function (action, i) {
                        return actionsContentItem(action, i);
                    })
                );
            }
            var extraContent = React.createElement(
                'div',
                { className: prefixCls + '-item-extra-wrap' },
                React.createElement(
                    'div',
                    { className: prefixCls + '-item-main' },
                    metaContent,
                    content,
                    actionsContent
                ),
                React.createElement(
                    'div',
                    { className: prefixCls + '-item-extra' },
                    extra
                )
            );
            var mainContent = grid ? React.createElement(
                _grid.Col,
                { span: getGrid(grid, 'column'), xs: getGrid(grid, 'xs'), sm: getGrid(grid, 'sm'), md: getGrid(grid, 'md'), lg: getGrid(grid, 'lg'), xl: getGrid(grid, 'xl'), xxl: getGrid(grid, 'xxl') },
                React.createElement(
                    'div',
                    (0, _extends3['default'])({}, others, { className: classString }),
                    extra && extraContent,
                    !extra && metaContent,
                    !extra && content,
                    !extra && actionsContent
                )
            ) : React.createElement(
                'div',
                (0, _extends3['default'])({}, others, { className: classString }),
                extra && extraContent,
                !extra && metaContent,
                !extra && content,
                !extra && actionsContent
            );
            return mainContent;
        }
    }]);
    return Item;
}(React.Component);

exports['default'] = Item;

Item.Meta = Meta;
Item.propTypes = {
    column: _propTypes2['default'].oneOf(GridColumns),
    xs: _propTypes2['default'].oneOf(GridColumns),
    sm: _propTypes2['default'].oneOf(GridColumns),
    md: _propTypes2['default'].oneOf(GridColumns),
    lg: _propTypes2['default'].oneOf(GridColumns),
    xl: _propTypes2['default'].oneOf(GridColumns),
    xxl: _propTypes2['default'].oneOf(GridColumns)
};
Item.contextTypes = {
    grid: _propTypes2['default'].any
};