import _extends from 'babel-runtime/helpers/extends';
import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import createDOMForm from 'rc-form/es/createDOMForm';
import createFormField from 'rc-form/es/createFormField';
import PureRenderMixin from 'rc-util/es/PureRenderMixin';
import omit from 'omit.js';
import warning from '../_util/warning';
import FormItem from './FormItem';
import { FIELD_META_PROP, FIELD_DATA_PROP } from './constants';

var Form = function (_React$Component) {
    _inherits(Form, _React$Component);

    function Form(props) {
        _classCallCheck(this, Form);

        var _this = _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).call(this, props));

        warning(!props.form, 'It is unnecessary to pass `form` to `Form` after antd@1.7.0.');
        return _this;
    }

    _createClass(Form, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return PureRenderMixin.shouldComponentUpdate.apply(this, args);
        }
    }, {
        key: 'getChildContext',
        value: function getChildContext() {
            var layout = this.props.layout;

            return {
                vertical: layout === 'vertical'
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var _classNames;

            var _props = this.props,
                prefixCls = _props.prefixCls,
                hideRequiredMark = _props.hideRequiredMark,
                _props$className = _props.className,
                className = _props$className === undefined ? '' : _props$className,
                layout = _props.layout;

            var formClassName = classNames(prefixCls, (_classNames = {}, _defineProperty(_classNames, prefixCls + '-horizontal', layout === 'horizontal'), _defineProperty(_classNames, prefixCls + '-vertical', layout === 'vertical'), _defineProperty(_classNames, prefixCls + '-inline', layout === 'inline'), _defineProperty(_classNames, prefixCls + '-hide-required-mark', hideRequiredMark), _classNames), className);
            var formProps = omit(this.props, ['prefixCls', 'className', 'layout', 'form', 'hideRequiredMark']);
            return React.createElement('form', _extends({}, formProps, { className: formClassName }));
        }
    }]);

    return Form;
}(React.Component);

export default Form;

Form.defaultProps = {
    prefixCls: 'ant-form',
    layout: 'horizontal',
    hideRequiredMark: false,
    onSubmit: function onSubmit(e) {
        e.preventDefault();
    }
};
Form.propTypes = {
    prefixCls: PropTypes.string,
    layout: PropTypes.oneOf(['horizontal', 'inline', 'vertical']),
    children: PropTypes.any,
    onSubmit: PropTypes.func,
    hideRequiredMark: PropTypes.bool
};
Form.childContextTypes = {
    vertical: PropTypes.bool
};
Form.Item = FormItem;
Form.createFormField = createFormField;
Form.create = function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return createDOMForm(_extends({ fieldNameProp: 'id' }, options, { fieldMetaProp: FIELD_META_PROP, fieldDataProp: FIELD_DATA_PROP }));
};