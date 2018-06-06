'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _rcSelect = require('rc-select');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _select = require('../select');

var _select2 = _interopRequireDefault(_select);

var _input = require('../input');

var _input2 = _interopRequireDefault(_input);

var _InputElement = require('./InputElement');

var _InputElement2 = _interopRequireDefault(_InputElement);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function isSelectOptionOrSelectOptGroup(child) {
    return child && child.type && (child.type.isSelectOption || child.type.isSelectOptGroup);
}

var AutoComplete = function (_React$Component) {
    (0, _inherits3['default'])(AutoComplete, _React$Component);

    function AutoComplete() {
        (0, _classCallCheck3['default'])(this, AutoComplete);

        var _this = (0, _possibleConstructorReturn3['default'])(this, (AutoComplete.__proto__ || Object.getPrototypeOf(AutoComplete)).apply(this, arguments));

        _this.getInputElement = function () {
            var children = _this.props.children;

            var element = children && React.isValidElement(children) && children.type !== _rcSelect.Option ? React.Children.only(_this.props.children) : React.createElement(_input2['default'], null);
            var elementProps = (0, _extends3['default'])({}, element.props);
            // https://github.com/ant-design/ant-design/pull/7742
            delete elementProps.children;
            return React.createElement(
                _InputElement2['default'],
                elementProps,
                element
            );
        };
        _this.saveSelect = function (node) {
            _this.select = node;
        };
        return _this;
    }

    (0, _createClass3['default'])(AutoComplete, [{
        key: 'focus',
        value: function focus() {
            this.select.focus();
        }
    }, {
        key: 'blur',
        value: function blur() {
            this.select.blur();
        }
    }, {
        key: 'render',
        value: function render() {
            var _classNames;

            var _props = this.props,
                size = _props.size,
                _props$className = _props.className,
                className = _props$className === undefined ? '' : _props$className,
                notFoundContent = _props.notFoundContent,
                prefixCls = _props.prefixCls,
                optionLabelProp = _props.optionLabelProp,
                dataSource = _props.dataSource,
                children = _props.children;

            var cls = (0, _classnames2['default'])((_classNames = {}, (0, _defineProperty3['default'])(_classNames, prefixCls + '-lg', size === 'large'), (0, _defineProperty3['default'])(_classNames, prefixCls + '-sm', size === 'small'), (0, _defineProperty3['default'])(_classNames, className, !!className), (0, _defineProperty3['default'])(_classNames, prefixCls + '-show-search', true), (0, _defineProperty3['default'])(_classNames, prefixCls + '-auto-complete', true), _classNames));
            var options = void 0;
            var childArray = React.Children.toArray(children);
            if (childArray.length && isSelectOptionOrSelectOptGroup(childArray[0])) {
                options = children;
            } else {
                options = dataSource ? dataSource.map(function (item) {
                    if (React.isValidElement(item)) {
                        return item;
                    }
                    switch (typeof item === 'undefined' ? 'undefined' : (0, _typeof3['default'])(item)) {
                        case 'string':
                            return React.createElement(
                                _rcSelect.Option,
                                { key: item },
                                item
                            );
                        case 'object':
                            return React.createElement(
                                _rcSelect.Option,
                                { key: item.value },
                                item.text
                            );
                        default:
                            throw new Error('AutoComplete[dataSource] only supports type `string[] | Object[]`.');
                    }
                }) : [];
            }
            return React.createElement(
                _select2['default'],
                (0, _extends3['default'])({}, this.props, { className: cls, mode: 'combobox', optionLabelProp: optionLabelProp, getInputElement: this.getInputElement, notFoundContent: notFoundContent, ref: this.saveSelect }),
                options
            );
        }
    }]);
    return AutoComplete;
}(React.Component);

exports['default'] = AutoComplete;

AutoComplete.Option = _rcSelect.Option;
AutoComplete.OptGroup = _rcSelect.OptGroup;
AutoComplete.defaultProps = {
    prefixCls: 'ant-select',
    transitionName: 'slide-up',
    optionLabelProp: 'children',
    choiceTransitionName: 'zoom',
    showSearch: false,
    filterOption: false
};
module.exports = exports['default'];