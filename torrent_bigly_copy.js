(function () {
  if (window.__torrent_bigly_copy_loaded) return;
  window.__torrent_bigly_copy_loaded = true;

  function getUrl(el) {
    if (!el) return '';
    return el.MagnetUri || el.Link || el.magnet || el.link || el.url || el.href || '';
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
    } catch (e) {}

    return false;
  }

  function toast(msg) {
    try {
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(msg);
      else if (typeof alert === 'function') alert(msg);
    } catch (e) {
      try { alert(msg); } catch (_) {}
    }
  }

  function openBigly(url) {
    const pkg = 'com.biglybt.android.client';
    const intents = [];

    if (/^magnet:?/i.test(url) || /^magnet:/i.test(url)) {
      intents.push(`intent:${url}#Intent;scheme=magnet;package=${pkg};end`);
      intents.push(url);
    } else {
      intents.push(url);
      intents.push(`intent://${encodeURIComponent(url)}#Intent;package=${pkg};end`);
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

  function clearMenu(menu) {
    if (!menu) return;
    if (typeof menu.clear === 'function') menu.clear();
    else if (Array.isArray(menu)) menu.length = 0;
  }

  function onLong(e) {
    const element = e && e.element ? e.element : null;
    const item = e && e.item ? e.item : null;
    const menu = e && e.menu ? e.menu : null;
    const url = getUrl(element) || getUrl(item);
    if (!url) return;

    clearMenu(menu);

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
    if (!window.Lampa || !window.Lampa.Listener || typeof Lampa.Listener.follow !== 'function') return;

    Lampa.Listener.follow('torrent', function (e) {
      if (!e || e.type !== 'onlong') return;
      onLong(e);
    });
  }

  if (window.Lampa) init();
  else document.addEventListener('lampa:init', init, { once: true });
})();
