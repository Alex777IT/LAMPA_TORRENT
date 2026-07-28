(function () {
  if (window.__torrent_bigly_copy_loaded) return;
  window.__torrent_bigly_copy_loaded = true;

  const PLUGIN = 'torrent_bigly_final';

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

  function inspectEvent(tag, e) {
    try {
      log(tag, e);
      log(tag + ' keys', e ? Object.keys(e) : []);
      if (e && e.element) log(tag + ' element keys', Object.keys(e.element));
      if (e && e.item) log(tag + ' item keys', Object.keys(e.item));
      if (e && e.menu) log(tag + ' menu keys', Object.keys(e.menu));
    } catch (err) {
      log(tag + ' inspect error', err);
    }
  }

  function pickUrl(obj) {
    if (!obj) return '';
    const keys = ['MagnetUri', 'magnet', 'link', 'url', 'href', 'torrent', 'uri', 'Link'];
    for (const k of keys) {
      try {
        if (obj[k]) return String(obj[k]);
      } catch (e) {}
    }
    return '';
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
      intents.push(intent:${url}#Intent;scheme=magnet;package=${pkg};end);
      intents.push(url);
    } else {
      intents.push(url);
      intents.push(intent://${encodeURIComponent(url)}#Intent;package=${pkg};end);
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

  function addItem(menu, title, cb) {
    if (!menu) return;
    const item = { title: title, selected: false, callback: cb };
    try {
      if (typeof menu.add === 'function') menu.add(item);
      else if (Array.isArray(menu)) menu.push(item);
    } catch (e) {
      log('addItem error', e);
    }
  }

  function clearMenu(menu) {
    if (!menu) return;
    try {
      if (typeof menu.clear === 'function') menu.clear();
      else if (Array.isArray(menu)) menu.length = 0;
    } catch (e) {
      log('clearMenu error', e);
    }
  }

  function onEvent(tag, e) {
    inspectEvent(tag, e);
    const element = e && e.element ? e.element : null;
    const item = e && e.item ? e.item : null;
    const menu = e && e.menu ? e.menu : null;
    const url = pickUrl(element) || pickUrl(item);

    if (!url) {
      log('no url in event');
      return;
    }

    log('url found', url);

    if (menu) {
      clearMenu(menu);

      addItem(menu, 'Скопировать ссылку', function () {
        const ok = copyText(url);
        toast(ok ? 'Ссылка скопирована' : 'Не удалось скопировать ссылку');
      });

      addItem(menu, 'Скачать торрент в BiglyBT', function () {
        const ok = openBigly(url);
        toast(ok ? 'Открываю BiglyBT' : 'Не удалось открыть BiglyBT');
      });
    } else {
      toast('URL найден: ' + url);
    }
  }

  function init() {
    try {
      toast('Плагин подключён');
      log('init', !!window.Lampa, window.appready);

      if (!window.Lampa  !Lampa.Listener  typeof Lampa.Listener.follow !== 'function') return;

      Lampa.Listener.follow('full', function (e) {
        onEvent('full', e);
      });

      Lampa.Listener.follow('torrent', function (e) {
        onEvent('torrent', e);
      });

      Lampa.Listener.follow('menu', function (e) {
        log('menu event', e);
      });

      log('listeners attached');
    } catch (e) {
      log('init error', e);
      toast('Ошибка плагина: ' + e);
    }
  }

  if (window.Lampa && window.appready) init();
  else if (window.Lampa) document.addEventListener('lampa:init', init, { once: true });
  else document.addEventListener('lampa:init', init, { once: true });
})();
