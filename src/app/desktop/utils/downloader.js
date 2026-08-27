import { ipcRenderer } from 'electron';

export const downloadInstanceFiles = async (
  arr,
  updatePercentage,
  threads = 4
) => {
  ipcRenderer.on('download-instance-files-progress', (e, p) =>
    updatePercentage(p)
  );
  const res = await ipcRenderer.invoke(
    'download-instance-files',
    arr,
    updatePercentage !== undefined,
    threads
  );
  console.log('Back:', res);
  ipcRenderer.removeAllListeners('download-instance-files-progress');
  return res;
};

export const downloadFile = async (fileName, url, onProgress) => {
  ipcRenderer.on('download-file-progress', (e, p) => onProgress(p));
  const res = await ipcRenderer.invoke(
    'download-file',
    fileName,
    url,
    onProgress !== undefined
  );
  console.log('Back-single:', res);
  ipcRenderer.removeAllListeners('download-file-progress');
  return res;
};
