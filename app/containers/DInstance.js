import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DInstance from '../components/DInstance/DInstance';
import * as downloadManagerActions from '../actions/downloadManager';

function mapStateToProps(state) {
  return {
    installingQueue: state.downloadManager.downloadQueue,
    userData: state.auth
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(downloadManagerActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DInstance);
