// Keep native video controls available without JavaScript or after a playback error.
(() => {
  const video = document.getElementById('c9n-explainer');
  const button = document.querySelector('.video-play');
  const error = document.querySelector('.video-error');
  if (!video || !button || !error) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    error.hidden = true;
    try {
      if (video.ended) video.currentTime = 0;
      await video.play();
    } catch {
      error.hidden = false;
    }
  });
  video.addEventListener('play', () => { button.hidden = true; error.hidden = true; });
  video.addEventListener('pause', () => { button.hidden = false; });
  video.addEventListener('ended', () => { button.hidden = false; });
  video.addEventListener('error', () => { button.hidden = false; error.hidden = false; });
})();
