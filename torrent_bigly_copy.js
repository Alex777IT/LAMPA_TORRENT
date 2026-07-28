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

  function getUrl(movie) {
    if (!movie) return '';
    return String(movie.MagnetUri || movie.magnet || movie.link || movie.url || movie.href || movie.torrent || movie.uri || movie.Link || '');
  }

  function buildIntent(url) {
    const pkg = 'com.biglybt.android.client';
    if (/^magnet:/i.test(url)) {
      return `intent:${url}#Intent;scheme=magnet;package=${pkg};action=android.intent.action.VIEW;end`;
    }
    return `intent://${encodeURIComponent(url)}#Intent;package=${pkg};action=android.intent.action.VIEW;end`;
  }

  function openBigly(url) {
    const intents = [];
    if (/^magnet:/i.test(url)) {
      intents.push(buildIntent(url));
      intents.push(url);
    } else {
      intents.push(url);
      intents.push(buildIntent(url));
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

  function addButton(render, movie) {
    if (!render || !movie) return;
    if (render.find('.torrent-bigly-btn-wrap').length) return;

    const url = getUrl(movie);
    if (!url) return;

    const wrap = $(
      '<div class="torrent-bigly-btn-wrap" style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"></div>'
    );

    const openBtn = $(
      '<div class="torrent-bigly-btn" style="padding:12px 16px; border-radius:10px; background:#2b7cff; color:#fff; font-weight:700; cursor:pointer;">Скачать торрент в BiglyBT</div>'
    );

    const copyBtn = $(
      '<div class="torrent-bigly-copy" style="padding:12px 16px; border-radius:10px; background:#444; color:#fff; font-weight:700; cursor:pointer;">Скопировать magnet</div>'
    );

    openBtn.on('click hover:enter', function () {
      const ok = openBigly(url);
      toast(ok ? 'Открываю BiglyBT' : 'Не удалось открыть BiglyBT');
    });

    copyBtn.on('click hover:enter', function () {
      const ok = copyText(url);
      toast(ok ? 'Magnet скопирован' : 'Не удалось скопировать magnet');
    });

    wrap.append(openBtn).append(copyBtn);
    render.after(wrap);
    log('buttons added', url);
  }

  function bindCurrent() {
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
      bindCurrent();

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
