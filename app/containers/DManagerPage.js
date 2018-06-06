import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DManager from '../components/Routes/DManager/DManager';
import * as downloadManagerActions from '../actions/downloadManager';

function mapStateToProps(state) {
  return {
    selectedJSONData: state.vanilla.selectedVersionDataManifest
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(downloadManagerActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DManager);
