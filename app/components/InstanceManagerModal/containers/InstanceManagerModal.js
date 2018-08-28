import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import InstanceManagerModal from '../InstanceManagerModal';
import * as packCreatorActions from '../../../actions/packCreator';
import * as downloadManagerActions from '../../../actions/downloadManager';

function mapStateToProps(state) {
  return {
    versionsManifest: state.packCreator.versionsManifest,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...packCreatorActions, ...downloadManagerActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(InstanceManagerModal);
