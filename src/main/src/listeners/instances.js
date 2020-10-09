import { addListener } from '../messageListener';
import EV from '../../../common/messageEvents';
import {
  deleteMods,
  installMod,
  toggleModDisabled,
  updateMod
} from '../instancesHandler/mods';
import { INSTANCES, renameInstance } from '../instancesHandler/instances';

addListener(EV.GET_INSTANCES, async () => INSTANCES);

addListener(EV.TOGGLE_MOD_DISABLED, toggleModDisabled);
addListener(EV.DELETE_MODS, deleteMods);
addListener(EV.INSTALL_MOD, installMod);
addListener(EV.UPDATE_MOD, updateMod);
addListener(EV.RENAME_INSTANCE, renameInstance);
