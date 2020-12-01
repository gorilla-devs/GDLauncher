import EV from 'src/common/messageEvents';
import { initManifestsFromMain } from '../common/reducers/actions';
import { handleMessage } from './helpers/sendMessage';

const setupRendererListeners = dispatch => {
  handleMessage(EV.GET_MANIFESTS, localManifests => {
    dispatch(initManifestsFromMain(localManifests));
  });
};

export default setupRendererListeners;
