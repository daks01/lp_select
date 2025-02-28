
document.addEventListener('DOMContentLoaded', () => {
    initVideoPlayer();
});

const manifestUri = './assets/hls/Animations-MP4.m3u8';

async function initVideoPlayer() {
  shaka.polyfill.installAll();

  if (!shaka.Player.isBrowserSupported()) {
    console.error('Browser not supported!');
    return;
  }

  const video = document.querySelector("[data-video]");
  const player = new shaka.Player();
  await player.attach(video);

  window.player = player;
  player.addEventListener('error', (e) => {
    console.error('Error code', e.detail.code, 'object', e.detail);
  });

  try {
    await player.load(manifestUri);
    console.log('The video has now been loaded!');
    initVideoScroll();
  } catch (e) {
    console.error('Error code', e.detail.code, 'object', e.detail);
  }
}

function initVideoScroll() {
  const container = document.body;
  const videoEl = document.querySelector("[data-video]");
  const scrollPositionY = window.scrollY;
  const totalScrollableHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrollPercentageY = 1 / totalScrollableHeight * scrollPositionY;
  const START_VIDEO_FRAME_POSITION = scrollPercentageY;
  let lastScrollPosition = 0;

  if (!document.body.contains(videoEl)) {
    return;
  }

  videoEl.addEventListener("timeupdate", updateScrollbarOnStop, true);
  setInterval(updateCurrentTimeAsScrollbarSay, 40);

  function updateScrollbarOnStop() {
    const currentTime = videoEl.currentTime;
    const videoDuration = videoEl.duration || 0;

    console.log(currentTime, videoDuration, START_VIDEO_FRAME_POSITION)
  }

  function updateCurrentTimeAsScrollbarSay() {
    const isGoNextThick =
      videoEl.readyState !== 4 ||
      lastScrollPosition === window.scrollY ||
      !videoEl.paused;

    if (isGoNextThick) {
      return;
    }

    const videoDuration = videoEl.duration;
    const scrollPosition = window.scrollY;
    lastScrollPosition = scrollPosition;

    videoEl.currentTime = (videoDuration / totalScrollableHeight) * scrollPosition;
  }
}


