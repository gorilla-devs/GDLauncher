import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Home from '../../Home/Home';
import * as downloadManagerActions from '../../../actions/downloadManager';
import * as newsActions from '../../../actions/news';

function mapStateToProps(state) {
  return {
    username: state.auth.displayName,
    news: state.news
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...downloadManagerActions, ...newsActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
