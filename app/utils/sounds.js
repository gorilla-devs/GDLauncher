import path from 'path';

import copy from '../assets/sounds/copy.wav';

const _soundsEnabled = true;

const _playSound = (sound) => {
  if (_soundsEnabled) {
    if (process.env.NODE_ENV === 'production') {
      const resourcesPath = process.resourcesPath;
      let audioFileName, audioPath;
      audioFileName = path.basename(sound);
      audioPath = path.resolve(resourcesPath, './app.asar/dist/' + audioFileName);
      const audio = new Audio(audioPath);
      audio.play();
    } else {
      const audio = new Audio(sound);
      audio.play();
    }
  }
}

export const playCopySound = () => {
  _playSound(copy);
}