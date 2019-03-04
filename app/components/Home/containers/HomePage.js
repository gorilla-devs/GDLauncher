import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Home from '../Home';
import { getNews } from '../../../actions/news';
import { getVanillaMCVersions, createPack } from '../../../actions/packCreator';
import { applyTheme } from '../../../actions/settings';

function mapStateToProps(state) {
  return {
    username: state.auth.displayName,
    newUser: state.auth.newUser,
    news: state.news,
    packCreationLoading: state.packCreator.loading,
    versionsManifest: state.packCreator.versionsManifest
  };
}

const mapDispatchToProps = {
  applyTheme,
  getNews,
  getVanillaMCVersions,
  createPack
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
