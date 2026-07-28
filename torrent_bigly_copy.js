(function () {
  if (window.__torrent_bigly_copy_loaded) return;
  window.__torrent_bigly_copy_loaded = true;

  const PLUGIN = 'torrent_bigly_button';

  function log() {
    try { console.log.apply(console, ['[' + PLUGIN + ']'].concat([].slice.call(arguments))); } catch (e) {}
  }

  function toast(msg) {
    try {
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(msg);
      else if (typeof alert === 'function') alert(msg);
    } catch (e) {
      try { alert(msg); } catch (_) {}
    }
  }

  function copyText(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', 'true');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) {
      return false;
    }
  }

  function openBigly(url) {
    const pkg = 'com.biglybt.android.client';
    const intents = [];

    if (/^magnet:/i.test(url)) {
      intents.push(`intent:${url}#Intent;scheme=magnet;package=${pkg};end`);
      intents.push(url);
    } else {
      intents.push(url);
      intents.push(`intent://${encodeURIComponent(url)}#Intent;package=${pkg};end`);
    }

    for (const u of intents) {
      try {
        log('open try', u);
        window.location.href = u;
        return true;
      } catch (e) {
        log('open failed', u, e);
      }
    }
    return false;
  }

  function getUrl(movie) {
    if (!movie) return '';
    return String(movie.MagnetUri || movie.magnet || movie.link || movie.url || movie.href || movie.torrent || movie.uri || movie.Link || '');
  }

  function addButton(render, movie) {
    if (!render || !movie) return;
    if (render.find('.torrent-bigly-btn').length) return;

    const url = getUrl(movie);
    if (!url) return;

    const btn = $('<div class="torrent-bigly-btn">Скачать торрент в BiglyBT</div>');
    btn.css({
      marginTop: '10px',
      padding: '12px 16px',
      borderRadius: '10px',
      background: '#2b7cff',
      color: '#fff',
      textAlign: 'center',
      fontWeight: '700',
      cursor: 'pointer'
    });

    btn.on('hover:enter click', function () {
      const ok = openBigly(url);
      toast(ok ? 'Открываю BiglyBT' : 'Не удалось открыть BiglyBT');
    });

    const copy = $('<div class="torrent-bigly-copy">Скопировать ссылку</div>');
    copy.css({
      marginTop: '8px',
      padding: '10px 14px',
      borderRadius: '10px',
      background: '#444',
      color: '#fff',
      textAlign: 'center',
      cursor: 'pointer'
    });

    copy.on('hover:enter click', function () {
      const ok = copyText(url);
      toast(ok ? 'Ссылка скопирована' : 'Не удалось скопировать ссылку');
    });

    render.after(btn);
    render.after(copy);
    log('buttons added', url);
  }

  function bindToCurrent() {
    try {
      const act = Lampa.Activity && typeof Lampa.Activity.active === 'function' ? Lampa.Activity.active() : null;
      if (!act || act.component !== 'full' || !act.activity || typeof act.activity.render !== 'function') return;
      const render = act.activity.render().find('.view--torrent');
      const movie = act.card || act.movie || (act.data && act.data.movie) || null;
      addButton(render, movie);
    } catch (e) {
      log('bind current error', e);
    }
  }

  function init() {
    try {
      toast('Плагин подключён');
      log('init');

      bindToCurrent();

      if (!window.Lampa || !Lampa.Listener || typeof Lampa.Listener.follow !== 'function') return;

      Lampa.Listener.follow('full', function (e) {
        try {
          if (e && e.type === 'complite') {
            const render = e.object && e.object.activity && typeof e.object.activity.render === 'function'
              ? e.object.activity.render().find('.view--torrent')
              : null;
            const movie = e.data && e.data.movie ? e.data.movie : null;
            addButton(render, movie);
          }
        } catch (err) {
          log('full listener error', err);
        }
      });
    } catch (e) {
      log('init error', e);
      toast('Ошибка плагина: ' + e);
    }
  }

  if (window.Lampa && window.appready) init();
  else if (window.Lampa) document.addEventListener('lampa:init', init, { once: true });
  else document.addEventListener('lampa:init', init, { once: true });
})();
