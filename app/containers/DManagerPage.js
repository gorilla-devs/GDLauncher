import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DManager from '../components/DManager/DManager';
import * as downloadManagerActions from '../actions/downloadManager';
import * as instancesManagerActions from '../actions/instancesManager';

function mapStateToProps(state) {
  return {
    installingQueue: state.downloadManager.downloadQueue,
    userData: state.auth
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...downloadManagerActions, ...instancesManagerActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DManager);
