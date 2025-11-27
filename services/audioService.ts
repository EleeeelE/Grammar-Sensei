
// Only keeping the click sound functionality as requested

// Default Volume
const CLICK_VOLUME = 0.4;

// State
let isSoundEnabled = true;

// --- Click Function ---

export const playClick = () => {
  if (!isSoundEnabled) return;
  // Using the crisp click sound
  const audio = new Audio("https://cdn.pixabay.com/download/audio/2023/04/27/audio_62b535d4d3.mp3?filename=click-124467.mp3"); 
  audio.volume = CLICK_VOLUME;
  audio.play().catch(() => {
    // Ignore autoplay errors if user hasn't interacted yet
  }); 
};

// --- Settings Control ---

export const setSoundEnabled = (enabled: boolean) => {
  isSoundEnabled = enabled;
};

// Deprecated functions kept as no-ops to prevent immediate crash if called before other files update, 
// though we will update App.tsx to remove calls to them.
export const initAudioSettings = (bgm: boolean, sfx: boolean, volume: number) => {
    isSoundEnabled = sfx;
};
export const setBgmEnabled = () => {};
export const setBgmVolume = () => {};
export const setSfxEnabled = (enabled: boolean) => { isSoundEnabled = enabled; };
export const playPop = () => {};
export const playSend = () => {};
export const playReceive = () => {};
export const playSuccess = () => {};
export const shuffleBgm = () => {};
