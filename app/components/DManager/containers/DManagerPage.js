import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DManager from '../DManager';
import * as downloadManagerActions from '../../../actions/downloadManager';
import * as instancesManagerActions from '../../../actions/instancesManager';

function mapStateToProps(state) {
  return {
    userData: state.auth,
    instances: state.instancesManager.instances
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { ...downloadManagerActions, ...instancesManagerActions },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DManager);
