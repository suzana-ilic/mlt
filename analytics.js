(function () {
  if (location.pathname.indexOf('dashboard') !== -1) return;

  var sid = sessionStorage.getItem('mlt_sid');
  if (!sid) {
    sid = (crypto.randomUUID && crypto.randomUUID()) ||
      Date.now().toString(36) + Math.random().toString(36).slice(2);
    sessionStorage.setItem('mlt_sid', sid);
  }

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: location.pathname + location.search,
      referrer: document.referrer || null,
      sessionId: sid
    }),
    keepalive: true
  }).catch(function () {});
})();
