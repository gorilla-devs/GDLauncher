const _soundsEnabled = true;

const _playSound = (sound) => {
  if (_soundsEnabled) {
    const audio = new Audio(`./${sound}`);
    audio.play();
  }
}

export const playCopySound = () => {
  _playSound('copy.wav');
}