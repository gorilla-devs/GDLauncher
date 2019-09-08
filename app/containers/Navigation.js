// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AuthActions from '../actions/accounts';
import NavigationBar from '../components/Common/WindowNavigation/NavigationBar';

function mapStateToProps(state) {
  return {
    location: state.router.location.pathname
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AuthActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationBar);
