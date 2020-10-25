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
  const parsedDate = Date.parse(date);
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

export const reflect = p => {
  return p.then(
    v => ({ v, status: true }),
    e => ({ e, status: false })
  );
};

export const mavenToArray = (s, nativeString, forceExt) => {
  const pathSplit = s.split(':');
  const fileName = pathSplit[3]
    ? `${pathSplit[2]}-${pathSplit[3]}`
    : pathSplit[2];
  const finalFileName = fileName.includes('@')
    ? fileName.replace('@', '.')
    : `${fileName}${nativeString || ''}${forceExt || '.jar'}`;
  const initPath = pathSplit[0]
    .split('.')
    .concat(pathSplit[1])
    .concat(pathSplit[2].split('@')[0])
    .concat(`${pathSplit[1]}-${finalFileName}`);
  return initPath;
};

export const convertOSToMCFormat = ElectronFormat => {
  switch (ElectronFormat) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'osx';
    case 'linux':
      return 'linux';
    default:
      return false;
  }
};

export const convertOSToJavaFormat = ElectronFormat => {
  switch (ElectronFormat) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'mac';
    case 'linux':
      return 'linux';
    default:
      return false;
  }
};

export const skipLibrary = lib => {
  let skip = false;
  if (lib.rules) {
    skip = true;
    lib.rules.forEach(({ action, os, features }) => {
      if (features) return true;
      if (
        action === 'allow' &&
        ((os && os.name === convertOSToMCFormat(process.platform)) || !os)
      ) {
        skip = false;
      }
      if (
        action === 'disallow' &&
        ((os && os.name === convertOSToMCFormat(process.platform)) || !os)
      ) {
        skip = true;
      }
    });
  }
  return skip;
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

export const normalizeModData = (data, projectID, modName) => {
  const temp = data;
  temp.name = modName;
  if (data.projectID && data.fileID) return temp;
  if (data.id) {
    temp.projectID = projectID;
    temp.fileID = data.id;
    delete temp.id;
    delete temp.projectId;
    delete temp.fileId;
  }
  return temp;
};

export const waitTime = s => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), s * 1000);
  });
};

export const isMod = (fileName, instancesPath) =>
  /^(\\|\/)([\w\d-.{}()[\]@#$%^&!\s])+((\\|\/)mods((\\|\/)(.*))(\.jar|\.disabled))$/.test(
    convertCompletePathToInstance(fileName, instancesPath)
  );

export const convertCompletePathToInstance = (f, instancesPath) => {
  const escapeRegExp = stringToGoIntoTheRegex => {
    return stringToGoIntoTheRegex.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  return f.replace(new RegExp(escapeRegExp(instancesPath), 'gi'), '');
};

export const isInstanceFolderPath = (f, instancesPath) =>
  /^(\\|\/)([\w\d-.{}()[\]@#$%^&!\s])+$/.test(
    convertCompletePathToInstance(f, instancesPath)
  );
