/* Hero 视频：不依赖浏览器自动播放策略
   —— 自己发起 play()，被拦就退化成一个可点的播放按钮，
      滚出视口时暂停，省电也避开后台节流。 */
(function () {
  var hero = document.querySelector('.hero');
  var video = document.querySelector('.hero-video');
  if (!hero || !video) return;

  var quiet = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wanted = !quiet;           // 用户是否希望它动
  var inView = true;

  // Safari 要求属性和属性值都在，光有 HTML 属性不够
  video.muted = true;
  video.playsInline = true;
  video.defaultMuted = true;

  function blocked(is) {
    hero.dataset.autoplay = is ? 'blocked' : 'ok';
  }

  function attempt() {
    if (!wanted || !inView) return;
    var p = video.play();
    if (p && p.catch) {
      p.then(function () { blocked(false); })
       .catch(function () { blocked(true); });
    }
  }

  if (quiet) {
    blocked(true);               // 停在海报帧，但留一个按钮让他自己决定
  } else {
    attempt();
    ['loadeddata', 'canplay'].forEach(function (e) {
      video.addEventListener(e, attempt, { once: false });
    });
    // 策略拦截的情况下，用户第一次任何交互就补播
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (e) {
      document.addEventListener(e, function once() {
        document.removeEventListener(e, once);
        if (video.paused) attempt();
      }, { passive: true });
    });
  }

  var btn = hero.querySelector('.hero-play');
  if (btn) {
    btn.addEventListener('click', function () {
      wanted = true;
      video.play().then(function () { blocked(false); });
    });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (!inView) { video.pause(); } else { attempt(); }
    }, { threshold: 0.05 }).observe(hero);
  }
})();
