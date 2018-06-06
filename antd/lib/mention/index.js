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

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _rcEditorMention = require('rc-editor-mention');

var _rcEditorMention2 = _interopRequireDefault(_rcEditorMention);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _shallowequal = require('shallowequal');

var _shallowequal2 = _interopRequireDefault(_shallowequal);

var _icon = require('../icon');

var _icon2 = _interopRequireDefault(_icon);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var Mention = function (_React$Component) {
    (0, _inherits3['default'])(Mention, _React$Component);

    function Mention(props) {
        (0, _classCallCheck3['default'])(this, Mention);

        var _this = (0, _possibleConstructorReturn3['default'])(this, (Mention.__proto__ || Object.getPrototypeOf(Mention)).call(this, props));

        _this.onSearchChange = function (value, prefix) {
            if (_this.props.onSearchChange) {
                return _this.props.onSearchChange(value, prefix);
            }
            return _this.defaultSearchChange(value);
        };
        _this.onChange = function (editorState) {
            if (_this.props.onChange) {
                _this.props.onChange(editorState);
            }
        };
        _this.onFocus = function (ev) {
            _this.setState({
                focus: true
            });
            if (_this.props.onFocus) {
                _this.props.onFocus(ev);
            }
        };
        _this.onBlur = function (ev) {
            _this.setState({
                focus: false
            });
            if (_this.props.onBlur) {
                _this.props.onBlur(ev);
            }
        };
        _this.focus = function () {
            _this.mentionEle._editor.focusEditor();
        };
        _this.mentionRef = function (ele) {
            _this.mentionEle = ele;
        };
        _this.state = {
            suggestions: props.suggestions,
            focus: false
        };
        return _this;
    }

    (0, _createClass3['default'])(Mention, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var suggestions = nextProps.suggestions;

            if (!(0, _shallowequal2['default'])(suggestions, this.props.suggestions)) {
                this.setState({
                    suggestions: suggestions
                });
            }
        }
    }, {
        key: 'defaultSearchChange',
        value: function defaultSearchChange(value) {
            var searchValue = value.toLowerCase();
            var filteredSuggestions = (this.props.suggestions || []).filter(function (suggestion) {
                if (suggestion.type && suggestion.type === _rcEditorMention.Nav) {
                    return suggestion.props.value ? suggestion.props.value.toLowerCase().indexOf(searchValue) !== -1 : true;
                }
                return suggestion.toLowerCase().indexOf(searchValue) !== -1;
            });
            this.setState({
                suggestions: filteredSuggestions
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _classNames;

            var _props = this.props,
                _props$className = _props.className,
                className = _props$className === undefined ? '' : _props$className,
                prefixCls = _props.prefixCls,
                loading = _props.loading,
                placement = _props.placement;
            var _state = this.state,
                suggestions = _state.suggestions,
                focus = _state.focus;

            var cls = (0, _classnames2['default'])(className, (_classNames = {}, (0, _defineProperty3['default'])(_classNames, prefixCls + '-active', focus), (0, _defineProperty3['default'])(_classNames, prefixCls + '-placement-top', placement === 'top'), _classNames));
            var notFoundContent = loading ? React.createElement(_icon2['default'], { type: 'loading' }) : this.props.notFoundContent;
            return React.createElement(_rcEditorMention2['default'], (0, _extends3['default'])({}, this.props, { className: cls, ref: this.mentionRef, onSearchChange: this.onSearchChange, onChange: this.onChange, onFocus: this.onFocus, onBlur: this.onBlur, suggestions: suggestions, notFoundContent: notFoundContent }));
        }
    }]);
    return Mention;
}(React.Component);

exports['default'] = Mention;

Mention.getMentions = _rcEditorMention.getMentions;
Mention.defaultProps = {
    prefixCls: 'ant-mention',
    notFoundContent: '无匹配结果，轻敲空格完成输入',
    loading: false,
    multiLines: false,
    placement: 'bottom'
};
Mention.Nav = _rcEditorMention.Nav;
Mention.toString = _rcEditorMention.toString;
Mention.toContentState = _rcEditorMention.toEditorState;
module.exports = exports['default'];