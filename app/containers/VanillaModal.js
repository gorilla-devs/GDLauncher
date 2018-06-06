import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import VanillaModal from '../components/VanillaModal/VanillaModal';
import * as VanillaMCActions from '../actions/VanillaMC';
import * as downloadManagerActions from '../actions/downloadManager';

function mapStateToProps(state) {
  return {
    versionsManifest: state.vanilla.versionsManifest,
    loadingData: state.vanilla.fetchingSelectedVersionData,
    fetchedData: state.vanilla.fetchedSelectedVersionData
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...VanillaMCActions, ...downloadManagerActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(VanillaModal);
