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
  const chapters = document.querySelector('.video-chapters');
  if (chapters) {
    chapters.hidden = false;
    const buttons = [...chapters.querySelectorAll('[data-video-time]')];
    buttons.forEach((chapter) => chapter.addEventListener('click', async () => {
      error.hidden = true;
      try {
        // Load metadata before seeking, including when a chapter is the first interaction.
        if (video.readyState === 0) {
          await new Promise((resolve, reject) => {
            const clean = () => {
              video.removeEventListener('loadedmetadata', loaded);
              video.removeEventListener('error', failed);
            };
            const loaded = () => { clean(); resolve(); };
            const failed = () => { clean(); reject(new Error('Video unavailable')); };
            video.addEventListener('loadedmetadata', loaded);
            video.addEventListener('error', failed);
            video.load();
          });
        }
        video.currentTime = Number(chapter.dataset.videoTime);
        await video.play();
      } catch {
        error.hidden = false;
      }
    }));
    video.addEventListener('timeupdate', () => buttons.forEach((chapter, i) => {
      const start = Number(chapter.dataset.videoTime);
      const end = i + 1 < buttons.length ? Number(buttons[i + 1].dataset.videoTime) : Infinity;
      chapter.setAttribute('aria-pressed', String(video.currentTime >= start && video.currentTime < end));
    }));
  }
  video.addEventListener('play', () => { button.hidden = true; error.hidden = true; });
  video.addEventListener('pause', () => { button.hidden = false; });
  video.addEventListener('ended', () => { button.hidden = false; });
  video.addEventListener('error', () => { button.hidden = false; error.hidden = false; });
})();
