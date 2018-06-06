// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AuthActions from '../actions/auth';
import NavigationBar from '../components/Layout/WindowNavigation/NavigationBar';

function mapStateToProps(state) {
  return {
    location: state.router.location.pathname
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AuthActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
