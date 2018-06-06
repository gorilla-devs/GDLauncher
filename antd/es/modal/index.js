import _extends from 'babel-runtime/helpers/extends';
import Modal from './Modal';
import confirm from './confirm';
Modal.info = function (props) {
    var config = _extends({ type: 'info', iconType: 'info-circle', okCancel: false }, props);
    return confirm(config);
};
Modal.success = function (props) {
    var config = _extends({ type: 'success', iconType: 'check-circle', okCancel: false }, props);
    return confirm(config);
};
Modal.error = function (props) {
    var config = _extends({ type: 'error', iconType: 'cross-circle', okCancel: false }, props);
    return confirm(config);
};
Modal.warning = Modal.warn = function (props) {
    var config = _extends({ type: 'warning', iconType: 'exclamation-circle', okCancel: false }, props);
    return confirm(config);
};
Modal.confirm = function (props) {
    var config = _extends({ type: 'confirm', okCancel: true }, props);
    return confirm(config);
};
export default Modal;