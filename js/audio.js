(function () {
  // Playlist usada na RADIO VOZ CAIPIRA. Cada vídeo toca SLICE_SECONDS segundos e avança para o próximo.
  var PLAYLIST_ID = 'PLy9SZ_XM4Hp_UxtlYsdkdBcR0FUwkh23E';
  var SLICE_SECONDS = 60;
  var HINT = 'Toque para ouvir com som';

  var bar = document.getElementById('audio-bar');
  var playBtn = document.getElementById('audio-play');
  var prevBtn = document.getElementById('audio-prev');
  var nextBtn = document.getElementById('audio-next');
  var soundBtn = document.getElementById('audio-sound');
  var statusEl = document.getElementById('audio-status');
  var trackEl = document.getElementById('audio-track');

  var player = null;
  var soundOn = false;
  var sliceTimer = null;

  statusEl.textContent = 'RADIO VOZ CAIPIRA';
  trackEl.textContent = HINT;

  function setPlayIcon(isPlaying) {
    playBtn.textContent = isPlaying ? '\u275A\u275A' : '\u25B6';
    playBtn.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Tocar');
  }

  function refreshTrack() {
    if (!player) return;
    if (!soundOn) {
      trackEl.textContent = HINT;
      return;
    }
    var data = player.getVideoData ? player.getVideoData() : null;
    if (data && data.title) trackEl.textContent = data.title;
  }

  // Unmute on a user gesture. Browsers block audible autoplay otherwise.
  function enableSound() {
    if (!player || soundOn) return;
    soundOn = true;
    soundBtn.setAttribute('aria-pressed', 'true');
    soundBtn.setAttribute('aria-label', 'Som ligado');
    player.unMute();
    player.setVolume(80);
    if (player.getPlayerState() !== YT.PlayerState.PLAYING) player.playVideo();
    refreshTrack();
  }

  // Advance each video after SLICE_SECONDS of playback time. Pausing stops the count.
  function startSliceWatch() {
    if (sliceTimer) return;
    sliceTimer = setInterval(function () {
      if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) return;
      if (player.getCurrentTime() >= SLICE_SECONDS) player.nextVideo();
    }, 1000);
  }

  function onReady() {
    player.mute();
    player.setVolume(80);
    player.playVideo();
    startSliceWatch();
    refreshTrack();
  }

  function onStateChange(event) {
    var S = YT.PlayerState;
    if (event.data === S.PLAYING) {
      setPlayIcon(true);
      refreshTrack();
    } else if (event.data === S.PAUSED) {
      setPlayIcon(false);
    } else if (event.data === S.ENDED) {
      // End of playlist: restart from the first video.
      player.playVideoAt(0);
    } else if (event.data === S.CUED || event.data === S.BUFFERING) {
      refreshTrack();
    }
  }

  // Unavailable or embed-blocked video: skip to the next one.
  function onError() {
    if (player) player.nextVideo();
  }

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('yt-audio', {
      height: '1',
      width: '1',
      playerVars: {
        listType: 'playlist',
        list: PLAYLIST_ID,
        autoplay: 0,
        controls: 0,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: onReady,
        onStateChange: onStateChange,
        onError: onError
      }
    });
  };

  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  tag.onerror = function () {
    statusEl.textContent = 'Rádio indisponível';
    trackEl.textContent = 'Não foi possível carregar o player';
    [playBtn, prevBtn, nextBtn, soundBtn].forEach(function (b) { b.disabled = true; });
  };
  document.head.appendChild(tag);

  playBtn.addEventListener('click', function () {
    if (!player) return;
    if (!soundOn) {
      enableSound();
      return;
    }
    if (player.getPlayerState() === YT.PlayerState.PLAYING) player.pauseVideo();
    else player.playVideo();
  });

  prevBtn.addEventListener('click', function () {
    if (!player) return;
    enableSound();
    player.previousVideo();
  });

  nextBtn.addEventListener('click', function () {
    if (!player) return;
    enableSound();
    player.nextVideo();
  });

  soundBtn.addEventListener('click', enableSound);

  // The first gesture anywhere on the page turns sound on. Gestures inside the
  // bar are handled by its own buttons, so the first tap on play is not doubled.
  // Listeners stay attached until sound is on, so a gesture before the player is ready is kept.
  function onFirstGesture(event) {
    if (soundOn || !player) return;
    if (bar.contains(event.target)) return;
    enableSound();
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (type) {
      document.removeEventListener(type, onFirstGesture);
    });
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (type) {
    document.addEventListener(type, onFirstGesture, { passive: true });
  });
})();
