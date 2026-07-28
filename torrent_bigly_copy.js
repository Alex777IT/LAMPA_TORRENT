(function () {
  if (window.__torrent_bigly_menu_loaded) return;
  window.__torrent_bigly_menu_loaded = true;

  const PLUGIN = 'torrent_bigly_menu';

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

  function getUrl(obj) {
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

  function openBrowser(url) {
    try {
      window.location.href = url;
      return true;
    } catch (e) {
      log('open browser failed', e);
      return false;
    }
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

  function setupMenu(e) {
    try {
      const element = e && e.element ? e.element : null;
      const item = e && e.item ? e.item : null;
      const menu = e && e.menu ? e.menu : null;
      const url = getUrl(element) || getUrl(item);

      log('event', e);
      log('url', url, 'menu', !!menu);

      if (!url || !menu) return;

      clearMenu(menu);

      addItem(menu, 'Скопировать magnet/ссылку', function () {
        const ok = copyText(url);
        toast(ok ? 'Скопировано' : 'Не удалось скопировать');
      });

      addItem(menu, 'Открыть ссылку в браузере', function () {
        const ok = openBrowser(url);
        toast(ok ? 'Открываю браузер' : 'Не удалось открыть браузер');
      });
    } catch (err) {
      log('setupMenu error', err);
    }
  }

  function init() {
    try {
      toast('Плагин подключён');
      log('init');

      if (!window.Lampa || !Lampa.Listener || typeof Lampa.Listener.follow !== 'function') return;

      Lampa.Listener.follow('full', function (e) {
        try {
          if (e && e.menu) setupMenu(e);
        } catch (err) {
          log('full listener error', err);
        }
      });

      Lampa.Listener.follow('torrent', function (e) {
        try {
          if (e && e.menu) setupMenu(e);
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
