import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DInstance from '../components/DInstance/DInstance';
import * as downloadManagerActions from '../actions/downloadManager';
import * as instancesManagerActions from '../actions/instancesManager';

function mapStateToProps(state) {
  return {
    installingQueue: state.downloadManager.downloadQueue,
    selectedInstance: state.instancesManager.selectedInstance,
    playing: state.instancesManager.startedInstances
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...downloadManagerActions, ...instancesManagerActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DInstance);
