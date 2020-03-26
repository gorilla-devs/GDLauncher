import { ipcRenderer } from 'electron';

export const sortByDate = (a, b) => {
  const dateA = new Date(a.fileDate);
  const dateB = new Date(b.fileDate);
  return dateB - dateA;
};

export function sortByForgeVersionDesc(a, b) {
  if (typeof a === 'string' && typeof b === 'string') {
    const versionA = a.split('.');
    const versionB = b.split('.');

    for (let i = 0; i < versionA.length; i += 1) {
      const verNumA = Number(versionA[i]) || 0;
      const verNumB = Number(versionB[i]) || 0;

      if (verNumA !== verNumB) {
        return verNumB - verNumA;
      }
    }
  }

  return 0;
}

export const getForgeFileIDFromAddonVersion = async (files, addonVersion) => {
  const foundID = files.find(a => a.fileName.includes(addonVersion));
  return foundID ? foundID.id : null;
};

export const generateRandomString = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Create the murmur hash of a mod
export const getFileMurmurHash2 = async filePath => {
  return ipcRenderer.invoke('calculateMurmur2FromPath', filePath);
};

export const numberToRoundedWord = number => {
  // Alter numbers larger than 1k
  if (number >= 1e3) {
    const units = ['k', 'M', 'B', 'T'];

    // Divide to get SI Unit engineering style numbers (1e3,1e6,1e9, etc)
    const unit = Math.floor((number.toFixed(0).length - 1) / 3) * 3;
    // Calculate the remainder
    const num = (number / `1e${unit}`).toFixed(0);
    const unitname = units[Math.floor(unit / 3) - 1];

    // output number remainder + unitname
    return num + unitname;
  }

  // return formatted original number
  return number.toLocaleString();
};

export const removeDuplicates = (myArr, prop) => {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
};
