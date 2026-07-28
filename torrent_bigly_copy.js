(function () {
  if (window.__torrent_menu_tools_loaded) return;
  window.__torrent_menu_tools_loaded = true;

  const PLUGIN = 'torrent_menu_tools';

  function log() {
    try {
      console.log.apply(console, ['[' + PLUGIN + ']'].concat([].slice.call(arguments)));
    } catch (e) {}
  }

  function toast(msg) {
    try {
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(msg);
      else if (typeof alert === 'function') alert(msg);
    } catch (e) {
      try { alert(msg); } catch (_) {}
    }
  }

  function isStr(v) {
    return typeof v === 'string' && v.trim().length > 0;
  }

  function pickUrl(obj) {
    if (!obj) return '';
    const keys = ['MagnetUri', 'magnet', 'link', 'url', 'href', 'torrent', 'uri', 'Link', 'file', 'download', 'download_url'];
    for (const k of keys) {
      try {
        const v = obj[k];
        if (isStr(v)) return String(v).trim();
      } catch (e) {}
    }
    return '';
  }

  function getUrl(e) {
    const candidates = [
      e && e.element,
      e && e.item,
      e && e.movie,
      e && e.data && e.data.movie
    ];
    for (const c of candidates) {
      const url = pickUrl(c);
      if (url) return url;
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
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) {
      log('copyText error', e);
      return false;
    }
  }

  function openBrowser(url) {
    try {
      window.location.href = url;
      return true;
    } catch (e) {
      log('openBrowser error', e);
      return false;
    }
  }

  function openTorrentClient(url) {
    const clients = [
      'com.biglybt.android.client',
      'com.transmissionbt.android',
      'com.utorrent.client',
      'org.proninyaroslav.libretorrent',
      'com.delphicoder.flud'
    ];

    const intents = [];

    if (/^magnet:/i.test(url)) {
      for (const pkg of clients) {
        intents.push(`intent:${url}#Intent;scheme=magnet;package=${pkg};action=android.intent.action.VIEW;end`);
      }
      intents.push(url);
    } else {
      for (const pkg of clients) {
        intents.push(`intent://${encodeURIComponent(url)}#Intent;package=${pkg};action=android.intent.action.VIEW;end`);
      }
      intents.push(url);
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
    if (!menu) return false;
    const item = { title: title, selected: false, callback: cb };
    try {
      if (typeof menu.add === 'function') {
        menu.add(item);
        return true;
      }
      if (Array.isArray(menu)) {
        menu.push(item);
        return true;
      }
    } catch (e) {
      log('addItem error', e);
    }
    return false;
  }

  function attachMenu(e) {
    try {
      const menu = e && e.menu ? e.menu : null;
      const url = getUrl(e);

      log('event keys', e ? Object.keys(e) : []);
      if (e && e.element) log('element keys', Object.keys(e.element));
      if (e && e.item) log('item keys', Object.keys(e.item));
      if (e && e.menu) log('menu keys', Object.keys(e.menu));

      if (!menu || !url) return false;

      addItem(menu, 'Скопировать magnet/ссылку', function () {
        const ok = copyText(url);
        toast(ok ? 'Ссылка скопирована' : 'Не удалось скопировать ссылку');
      });

      addItem(menu, 'Открыть .torrent в браузере', function () {
        const ok = openBrowser(url);
        toast(ok ? 'Открываю браузер' : 'Не удалось открыть браузер');
      });

      addItem(menu, 'Открыть в торрент-клиенте', function () {
        const ok = openTorrentClient(url);
        toast(ok ? 'Открываю торрент-клиент' : 'Не удалось открыть торрент-клиент');
      });

      toast('Пункты меню добавлены');
      return true;
    } catch (err) {
      log('attachMenu error', err);
      return false;
    }
  }

  function init() {
    try {
      toast('Плагин подключён');
      log('init', !!window.Lampa, window.appready);

      if (!window.Lampa || !Lampa.Listener || typeof Lampa.Listener.follow !== 'function') return;

      Lampa.Listener.follow('full', function (e) {
        try {
          if (e && e.menu) attachMenu(e);
        } catch (err) {
          log('full listener error', err);
        }
      });

      Lampa.Listener.follow('torrent', function (e) {
        try {
          if (e && e.menu) attachMenu(e);
        } catch (err) {
          log('torrent listener error', err);
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
