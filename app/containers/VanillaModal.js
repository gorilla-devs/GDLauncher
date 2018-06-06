import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import VanillaModal from '../components/VanillaModal/VanillaModal';
import * as packManagerActions from '../actions/packManager';
import * as downloadManagerActions from '../actions/downloadManager';

function mapStateToProps(state) {
  return {
    versionsManifest: state.packManager.versionsManifest,
    loadingData: state.packManager.fetchingSelectedVersionData,
    fetchedData: state.packManager.fetchedSelectedVersionData
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...packManagerActions, ...downloadManagerActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(VanillaModal);
