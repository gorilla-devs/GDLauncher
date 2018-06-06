import _extends from 'babel-runtime/helpers/extends';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

var InputElement = function (_React$Component) {
    _inherits(InputElement, _React$Component);

    function InputElement() {
        _classCallCheck(this, InputElement);

        var _this = _possibleConstructorReturn(this, (InputElement.__proto__ || Object.getPrototypeOf(InputElement)).apply(this, arguments));

        _this.focus = function () {
            _this.ele.focus ? _this.ele.focus() : ReactDOM.findDOMNode(_this.ele).focus();
        };
        _this.blur = function () {
            _this.ele.blur ? _this.ele.blur() : ReactDOM.findDOMNode(_this.ele).blur();
        };
        _this.saveRef = function (ele) {
            _this.ele = ele;
            var childRef = _this.props.children.ref;

            if (typeof childRef === 'function') {
                childRef(ele);
            }
        };
        return _this;
    }

    _createClass(InputElement, [{
        key: 'render',
        value: function render() {
            return React.cloneElement(this.props.children, _extends({}, this.props, { ref: this.saveRef }), null);
        }
    }]);

    return InputElement;
}(React.Component);

export default InputElement;