import _extends from 'babel-runtime/helpers/extends';
import defaultLocale from '../locale-provider/default';
var runtimeLocale = _extends({}, defaultLocale.Modal);
export function changeConfirmLocale(newLocale) {
    if (newLocale) {
        runtimeLocale = _extends({}, runtimeLocale, newLocale);
    } else {
        runtimeLocale = _extends({}, defaultLocale.Modal);
    }
}
export function getConfirmLocale() {
    return runtimeLocale;
}