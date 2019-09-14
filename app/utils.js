import murmur from 'murmurhash-js';

export const sortByDate = (a, b) => {
  const dateA = new Date(a.fileDate);
  const dateB = new Date(b.fileDate);
  return dateB - dateA;
};

export const getForgeFileIDFromAddonVersion = async (files, addonVersion) => {
  const foundID = files.find(a => a.fileName.includes(addonVersion));
  return foundID ? foundID.id : null;
};

// Converts an array of bytes into a string
const bin2string = array => {
  let result = '';
  for (let i = 0; i < array.length; i += 1) {
    if (!isWhitespaceCharacter(array[i]))
      result += String.fromCharCode(array[i]);
  }
  return result;
};

// Returns if a specific byte is a whitespace
const isWhitespaceCharacter = b => {
  return b === 9 || b === 10 || b === 13 || b === 32;
};

// Create the murmur hash of a mod
export const getFileMurmurHash2 = file => {
  return murmur.murmur2(bin2string(file), 1);
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
