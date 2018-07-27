import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Home from '../../Home/Home';
import * as downloadManagerActions from '../../../actions/downloadManager';

function mapStateToProps(state) {
  return {
    username: state.auth.username
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(downloadManagerActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
