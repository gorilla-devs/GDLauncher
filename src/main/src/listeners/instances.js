import { addListener } from '../messageListener';
import EV from '../../../common/messageEvents';
import {
  deleteMods,
  installMod,
  INSTANCES,
  toggleModDisabled,
  updateMod
} from '../instancesHandler';

addListener(EV.GET_INSTANCES, async () => INSTANCES);

addListener(EV.TOGGLE_MOD_DISABLED, toggleModDisabled);
addListener(EV.DELETE_MODS, deleteMods);
addListener(EV.INSTALL_MOD, installMod);
addListener(EV.UPDATE_MOD, updateMod);
