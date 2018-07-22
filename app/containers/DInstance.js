import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DInstance from '../components/DInstance/DInstance';
import * as downloadManagerActions from '../actions/downloadManager';
import * as instancesManagerActions from '../actions/instancesManager';

function mapStateToProps(state) {
  return {
    installingQueue: state.downloadManager.downloadQueue,
    userData: state.auth,
    selectedInstance: state.instancesManager.selectedInstance
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...downloadManagerActions, ...instancesManagerActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DInstance);
