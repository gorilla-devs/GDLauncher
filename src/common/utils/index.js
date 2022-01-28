import { ipcRenderer } from 'electron';

export const sortByDate = (a, b) => {
  const dateA = new Date(a.fileDate);
  const dateB = new Date(b.fileDate);
  return dateB - dateA;
};

export function sortByForgeVersionDesc(a, b) {
  if (typeof a === 'string' && typeof b === 'string') {
    const versionA = a.split('-')[1].split('.');
    const versionB = b.split('-')[1].split('.');

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

export const formatNumber = number => {
  // Alter numbers larger than 1k
  if (number >= 1e3) {
    const units = ['k', 'M', 'B', 'T'];

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

export const formatDate = date => {
  let parsedDate = date;
  if (typeof date !== 'number') {
    parsedDate = Date.parse(date);
  }
  return new Date(parsedDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

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

export const convertMinutesToHumanTime = minutes => {
  const days = Math.floor(minutes / 1440); // 60*24
  const hours = Math.floor((minutes - days * 1440) / 60);
  const min = Math.round(minutes % 60);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(weeks / 4);

  // values to display: d, h, m, minutes, days, weeks, months

  switch (true) {
    case months >= 2:
      return `${months} months`;
    case months === 1:
      return `1 month`;
    case weeks >= 2:
      return `${weeks} weeks`;
    case weeks === 1:
      return `1 week`;
    case days >= 1:
      return `${days} d, ${hours} h, ${min} m`;
    case hours >= 2:
      return `${hours} h, ${min} m`;
    case hours === 1:
      return `1 hour`;
    case minutes >= 2:
      return `${min} minutes`;
    case minutes === 1:
      return `1 minute`;
    case minutes === 0:
      return '0 minutes';
    default:
      return '';
  }
};

export const scaleMem = x => Math.log2(x / 1024);
export const scaleMemInv = x => 1024 * 2 ** x;
export const sysMemScaled = Math.round(
  scaleMem(process.getSystemMemoryInfo().total / 1024)
);
export const marksScaled = Array.from({ length: sysMemScaled + 1 }, (_, i) =>
  scaleMemInv(i)
);
export const marks =
  sysMemScaled > 6
    ? marksScaled.map(x => `${x / 1024} GB`)
    : marksScaled.map(x => `${x} MB`);
