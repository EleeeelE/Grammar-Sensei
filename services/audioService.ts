
// Default Volume
const CLICK_VOLUME = 0.4;
let DEFAULT_BGM_VOLUME = 0.08;

// State
let isSoundEnabled = true;
let isBgmEnabled = false;
let bgmAudio: HTMLAudioElement | null = null;
let currentBgmIndex = 0;

// Cute Lofi / Cozy Ambient Playlist
const BGM_TRACKS = [
  "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112778.mp3", // Lofi Study
  "https://cdn.pixabay.com/download/audio/2022/02/07/audio_6b158098c7.mp3?filename=empty-mind-118973.mp3", // Empty Mind
  "https://cdn.pixabay.com/download/audio/2022/03/23/audio_07963d1a47.mp3?filename=sweet-112638.mp3",      // Sweet
  "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=perfect-beauty-115053.mp3" // Relaxing
];

// --- Click Function ---

export const playClick = () => {
  if (!isSoundEnabled) return;
  const audio = new Audio("https://cdn.pixabay.com/download/audio/2023/04/27/audio_62b535d4d3.mp3?filename=click-124467.mp3"); 
  audio.volume = CLICK_VOLUME;
  audio.play().catch(() => {}); 
};

// --- BGM Functions ---

const initBgm = () => {
  if (!bgmAudio) {
    bgmAudio = new Audio(BGM_TRACKS[currentBgmIndex]);
    bgmAudio.loop = true;
    bgmAudio.volume = DEFAULT_BGM_VOLUME;
  }
};

export const setBgmEnabled = (enabled: boolean) => {
  isBgmEnabled = enabled;
  if (enabled) {
    if (!bgmAudio) initBgm();
    bgmAudio?.play().catch(e => console.log("BGM play failed (interaction needed)", e));
  } else {
    bgmAudio?.pause();
  }
};

export const setBgmVolume = (volume: number) => {
  DEFAULT_BGM_VOLUME = volume; // Update global var for new tracks
  if (bgmAudio) {
    bgmAudio.volume = volume;
  }
};

export const shuffleBgm = () => {
  if (!bgmAudio) initBgm();
  
  // Pick random track different from current
  let newIndex = currentBgmIndex;
  while (newIndex === currentBgmIndex && BGM_TRACKS.length > 1) {
    newIndex = Math.floor(Math.random() * BGM_TRACKS.length);
  }
  
  currentBgmIndex = newIndex;
  
  const wasPlaying = !bgmAudio?.paused;
  
  if (bgmAudio) {
    bgmAudio.src = BGM_TRACKS[currentBgmIndex];
    bgmAudio.volume = DEFAULT_BGM_VOLUME;
    if (isBgmEnabled) {
      bgmAudio.play().catch(() => {});
    }
  }
};

// --- Settings Control ---

export const setSoundEnabled = (enabled: boolean) => {
  isSoundEnabled = enabled;
};

// Deprecated no-ops
export const initAudioSettings = (bgm: boolean, sfx: boolean, volume: number) => {
    isSoundEnabled = sfx;
    setBgmEnabled(bgm);
    setBgmVolume(volume);
};
export const setSfxEnabled = (enabled: boolean) => { isSoundEnabled = enabled; };
export const playPop = () => {};
export const playSend = () => {};
export const playReceive = () => {};
export const playSuccess = () => {};
