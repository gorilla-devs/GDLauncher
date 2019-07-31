export const ADD_NEW_LATEST_MOD_UPDATE = 'ADD_NEW_LATEST_MOD_UPDATE';

export function addNewModToLatestUpdates(newMod) {
  return (dispatch, getState) => {
    const { latestModsUpdates } = getState();
    if (!latestModsUpdates.find(v => v.projectID === newMod.projectID)) {
      dispatch({
        type: ADD_NEW_LATEST_MOD_UPDATE,
        newMod: {
          id: newMod.id,
          fileName: newMod.fileName,
          fileDate: newMod.fileDate,
          projectID: newMod.projectID,
          packageFingerprint: newMod.packageFingerprint
        }
      });
    }
  };
}