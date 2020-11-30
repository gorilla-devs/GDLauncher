import EV from 'src/common/messageEvents';
import { addListener } from '../messageListener';
import { MANIFESTS } from '../manifests';

addListener(EV.GET_MANIFESTS, async () => {
  return MANIFESTS;
});
