(function () {
  if (window.__lampa_test_loaded) return;
  window.__lampa_test_loaded = true;

  function show(msg) {
    try {
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(msg);
      else alert(msg);
    } catch (e) {
      try { alert(msg); } catch (_) {}
    }
  }

  function start() {
    show('Lampa видит плагин');
    console.log('[lampa_test] plugin started');
  }

  if (window.appready) start();
  else if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
    Lampa.Listener.follow('app', function (e) {
      if (e && e.type === 'ready') start();
    });
  } else {
    document.addEventListener('lampa:init', start, { once: true });
  }
})();
