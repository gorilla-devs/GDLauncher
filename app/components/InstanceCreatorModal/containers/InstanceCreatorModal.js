import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import InstanceCreatorModal from '../InstanceCreatorModal';
import * as packCreatorActions from '../../../actions/packCreator';
import * as downloadManagerActions from '../../../actions/downloadManager';

function mapStateToProps(state) {
  return {
    versionsManifest: state.packCreator.versionsManifest,
    forgeManifest: state.packCreator.forgeManifest,
    modalState: state.packCreator.modalState,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...packCreatorActions, ...downloadManagerActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(InstanceCreatorModal);
