function toggleSound() {
  settings.sound = !settings.sound;
  applySoundSettings();
  saveGame();
}

function applySoundSettings() {
  const volume = settings.sound ? 1 : 0;

  sfxDraw.volume = volume;
  sfxHit.volume = volume;
  sfxWin.volume = volume;
  sfxLose.volume = volume;
  
  updateSoundButton();
}
