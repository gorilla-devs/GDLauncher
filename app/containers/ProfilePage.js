import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Profile from '../components/Profile/Profile';
import * as CounterActions from '../actions/counter';

function mapStateToProps(state) {
  return {
    displayName: state.auth.displayName
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(CounterActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
