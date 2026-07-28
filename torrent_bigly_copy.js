[28.07.2026 18:48] Александр: (function () {
  if (window.__torrent_bigly_copy_loaded) return;
  window.__torrent_bigly_copy_loaded = true;

  function getUrl(el) {
    if (!el) return '';
    return el.MagnetUri  el.Link  el.magnet  el.link  el.url  '';
  }

  function copyText(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
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
      document.execCommand('copy');
      ta.remove();
      return true;
    } catch (e) {}
    return false;
  }

  function toast(msg) {
    try {
      if (window.Lampa && Lampa.Noty) Lampa.Noty.show(msg);
      else alert(msg);
    } catch (e) {
      try { alert(msg); } catch (_) {}
    }
  }

  function openBigly(url) {
    const pkg = 'com.biglybt.android.client';
    const intents = [];

    if (/^magnet:?/i.test(url)) {
      intents.push(intent:${url}#Intent;scheme=magnet;package=${pkg};end);
      intents.push(url);
    } else {
      intents.push(url);
      intents.push(intent://${encodeURIComponent(url)}#Intent;package=${pkg};end);
    }

    for (const u of intents) {
      try {
        window.location.href = u;
        return true;
      } catch (e) {}
    }
    return false;
  }

  function addItem(menu, title, cb) {
    if (!menu) return;
    const item = { title: title, selected: false, callback: cb };
    if (typeof menu.add === 'function') menu.add(item);
    else if (Array.isArray(menu)) menu.push(item);
  }

  function onLong(e) {
    const element = e && e.element ? e.element : null;
    const item = e && e.item ? e.item : null;
    const menu = e && e.menu ? e.menu : null;
    const url = getUrl(element)  getUrl(item);
    if (!url) return;

    if (menu && typeof menu.clear === 'function') menu.clear();
    else if (menu && Array.isArray(menu)) menu.length = 0;

    addItem(menu, 'Скопировать ссылку', function () {
      const ok = copyText(url);
      toast(ok ? 'Ссылка скопирована' : 'Не удалось скопировать ссылку');
    });

    addItem(menu, 'Открыть в BiglyBT', function () {
      const ok = openBigly(url);
      toast(ok ? 'Открываю BiglyBT' : 'Не удалось открыть BiglyBT');
    });
  }

  function init() {
    if (!window.Lampa  !Lampa.Listener) return;
    Lampa.Listener.follow('torrent', function (e) {
      if (!e  e.type !== 'onlong') return;
      onLong(e);
    });
  }

  if (window.Lampa) init();
  else document.addEventListener('lampa:init', init, { once: true });
})();
[28.07.2026 19:16] Александр: (function () {
  const PLUGIN = 'torrent_bigly_diag';

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

  function safeStringify(v) {
    try {
      return JSON.stringify(v, function (k, val) {
        if (val && val.nodeType) return '[DOM]';
        if (typeof val === 'function') return '[Function]';
        return val;
      }, 2);
    } catch (e) {
      try { return String(v); } catch (_) { return '[unprintable]'; }
    }
  }

  function inspectEvent(tag, e) {
    log(tag, e);
    try {
      log(tag + ' keys', e ? Object.keys(e) : []);
      if (e && e.element) log(tag + ' element keys', Object.keys(e.element));
      if (e && e.item) log(tag + ' item keys', Object.keys(e.item));
      if (e && e.menu) log(tag + ' menu keys', Object.keys(e.menu));
    } catch (err) {
      log(tag + ' inspect error', err);
    }
  }

  function getUrl(el) {
    if (!el) return '';
    const keys = ['MagnetUri', 'Link', 'magnet', 'link', 'url', 'href', 'torrent', 'uri'];
    for (const k of keys) {
      try {
        if (el[k]) return String(el[k]);
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
        log('trying open', u);
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
      else log('menu type unknown', menu);
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

  function onEvent(channel, e) {
    inspectEvent(channel, e);
    const element = e && e.element ? e.element : null;
    const item = e && e.item ? e.item : null;
    const menu = e && e.menu ? e.menu : null;
    const url = getUrl(element) || getUrl(item);
    if (url) {
      log('url found', url);
      if (menu) {
        clearMenu(menu);
        addItem(menu, 'Скопировать ссылку', function () {
          const ok = copyText(url);
          toast(ok ? 'Ссылка скопирована' : 'Не удалось скопировать ссылку');
          log('copy result', ok, url);
        });
        addItem(menu, 'Открыть в BiglyBT', function () {
          const ok = openBigly(url);
          toast(ok ? 'Открываю BiglyBT' : 'Не удалось открыть BiglyBT');
          log('open result', ok, url);
        });
      } else {
        log('no menu, just toast');
        toast('URL найден: ' + url);
      }
    }
  }

  function init() {
    try {
      log('init called', !!window.Lampa, window.appready);
      toast('Диагностика плагина запущена');

      if (!window.Lampa  !Lampa.Listener  typeof Lampa.Listener.follow !== 'function') {
        log('Lampa or Listener missing');
        return;
      }

      Lampa.Listener.follow('app', function (e) {
        log('app event', e);
      });

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
  else if (window.Lampa) {
    document.addEventListener('lampa:init', init, { once: true });
    setTimeout(init, 3000);
  } else {
    document.addEventListener('lampa:init', init, { once: true });
  }
})();
