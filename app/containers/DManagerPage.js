import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DManager from '../components/DManager/DManager';
import * as downloadManagerActions from '../actions/downloadManager';

function mapStateToProps(state) {
  return {
    installingQueue: state.downloadManager.downloadQueue
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(downloadManagerActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DManager);
