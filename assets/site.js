/* Hero 视频：想尽一切办法让它自己播起来，不打扰用户。
   - muted + playsinline，双端都满足免交互播放条件
   - load 时主动 play()，事件到齐后再补试
   - 被浏览器策略拦下时保持静默，用户首次任意点击/按键时重试
   - 滚出视口暂停省电，回来自动续播 */
(function () {
  var hero = document.querySelector('.hero');
  var video = document.querySelector('.hero-video');
  if (!hero || !video) return;

  var inView = true;

  // Safari 只认属性值，HTML 属性有时不够
  video.muted = true;
  video.playsInline = true;

  function attempt() {
    if (!inView) return;
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* 静默，等首次交互重试 */ });
  }

  attempt();
  ['loadeddata', 'canplay'].forEach(function (e) {
    video.addEventListener(e, attempt);
  });

  // 自动播放被策略拦截时的兜底：用户第一次任何交互就补播，无任何 UI
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (e) {
    document.addEventListener(e, function once() {
      document.removeEventListener(e, once);
      if (video.paused) attempt();
    }, { passive: true, capture: true });
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) { attempt(); } else { video.pause(); }
    }, { threshold: 0.05 }).observe(hero);
  }
})();
