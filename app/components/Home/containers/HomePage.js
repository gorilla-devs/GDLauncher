import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Home from '../../Home/Home';
import * as downloadManagerActions from '../../../actions/downloadManager';
import * as newsActions from '../../../actions/news';
import * as packCreator from '../../../actions/packCreator';

function mapStateToProps(state) {
  return {
    username: state.auth.displayName,
    news: state.news,
    packCreationLoading: state.packCreator.loading
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...downloadManagerActions, ...newsActions, ...packCreator }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
