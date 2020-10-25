import { addListener } from '../messageListener';
import EV from '../../../common/messageEvents';
import {
  deleteMods,
  installMod,
  toggleModDisabled,
  updateMod
} from '../instancesHandler/mods';
import {
  createExtractZip,
  INSTANCES,
  renameInstance
} from '../instancesHandler/instances';
import {
  applyInstall,
  changeModpackVersion,
  installInstance
} from '../instancesHandler/installer';
import { librariesMapper } from '../helpers';

addListener(EV.GET_INSTANCES, async () => INSTANCES);

addListener(EV.TOGGLE_MOD_DISABLED, toggleModDisabled);
addListener(EV.DELETE_MODS, deleteMods);
addListener(EV.INSTALL_MOD, installMod);
addListener(EV.UPDATE_MOD, updateMod);
addListener(EV.RENAME_INSTANCE, renameInstance);
addListener(EV.CREATE_EXTRACT_ZIP, createExtractZip);

addListener(EV.INSTALL_INSTANCE, installInstance);
addListener(EV.APPLY_INSTALL_INSTANCE, applyInstall);
addListener(EV.UPDATE_MODPACK_VERSION, changeModpackVersion);

addListener(EV.MAP_LIBRARIES, librariesMapper);
