import path from 'path';
import store from '../localStore';
import copy from '../assets/sounds/copy.wav';

const _playSound = sound => {
  const audio = new Audio(sound);
  audio.play();
};

export const playCopySound = () => {
  _playSound(copy);
};
