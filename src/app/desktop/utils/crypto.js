/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-properties */
/* eslint-disable no-bitwise */
import crypto from 'crypto';

export function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += Math.pow(str.charCodeAt(i) * 31, str.length - i);
    hash &= hash; // Convert to 32bit integer
  }

  return hash;
}

export function uuidFromUsername(nickname) {
  const buff = crypto
    .createHash('md5')
    .update(`OfflinePlayer:${nickname}`)
    .digest();
  buff[6] &= 0x0f;
  buff[6] |= 0x30;
  buff[8] &= 0x3f;
  buff[8] |= 0x80;
  const rawHex = buff.toString('hex');
  return [
    rawHex.slice(0, 8),
    rawHex.slice(8, 12),
    rawHex.slice(12, 16),
    rawHex.slice(16, 20),
    rawHex.slice(20)
  ].join('-');
}

export default {
  hashCode,
  uuidFromUsername
};
