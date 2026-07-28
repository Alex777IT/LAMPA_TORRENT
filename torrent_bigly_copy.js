(function () {
  if (window.__torrent_test_loaded) return;
  window.__torrent_test_loaded = true;

  function toast(msg) {
    try {
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(msg);
      else alert(msg);
    } catch (e) {
      try { alert(msg); } catch (_) {}
    }
  }

  function log() {
    try { console.log.apply(console, ['[torrent_test]'].concat([].slice.call(arguments))); } catch (e) {}
  }

  function getMovie(act) {
    return act && (act.card || act.movie || (act.data && act.data.movie)) || null;
  }

  function getUrl(movie) {
    if (!movie) return '';
    return String(movie.MagnetUri || movie.magnet || movie.link || movie.url || movie.href || movie.torrent || movie.uri || movie.Link || '');
  }

  function addButton(render, movie) {
    try {
      if (!render || !movie) return false;
      if (render.find('.torrent-test-btn-wrap').length) return true;

      const url = getUrl(movie);
      if (!url) return false;

      const wrap = $('<div class="torrent-test-btn-wrap" style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"></div>');
      const btn = $('<div style="padding:12px 16px; border-radius:10px; background:#2b7cff; color:#fff; font-weight:700; cursor:pointer;">ТЕСТ КНОПКА</div>');
      btn.on('click hover:enter', function () {
        toast('URL: ' + url);
        log('clicked', url);
      });
      wrap.append(btn);
      render.after(wrap);
      toast('Кнопка добавлена');
      log('added', url);
      return true;
    } catch (e) {
      log('addButton error', e);
      return false;
    }
  }

  function tryBindCurrent() {
    try {
      const act = Lampa.Activity && typeof Lampa.Activity.active === 'function' ? Lampa.Activity.active() : null;
      if (!act) return false;
      log('active', act.component, act);

      if (act.component !== 'full' || !act.activity || typeof act.activity.render !== 'function') return false;

      const render = act.activity.render().find('.view--torrent');
      const movie = getMovie(act);
      const ok = addButton(render, movie);
      log('bind current', ok, !!render, !!movie);
      return ok;
    } catch (e) {
      log('tryBindCurrent error', e);
      return false;
    }
  }

  function init() {
    toast('test plugin loaded');
    tryBindCurrent();

    if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
      Lampa.Listener.follow('full', function (e) {
        try {
          log('full event', e);
          if (e && e.type === 'complite') {
            const render = e.object && e.object.activity && typeof e.object.activity.render === 'function'
              ? e.object.activity.render().find('.view--torrent')
              : null;
            const movie = e.data && e.data.movie ? e.data.movie : null;
            const ok = addButton(render, movie);
            log('full complite', ok);
          }
        } catch (err) {
          log('listener error', err);
        }
      });
    }
  }

  if (window.Lampa && window.appready) init();
  else document.addEventListener('lampa:init', init, { once: true });
})();
