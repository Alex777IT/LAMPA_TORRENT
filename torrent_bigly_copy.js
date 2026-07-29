(function () {
  if (window.__torrent_menu_tools_loaded) return;
  window.__torrent_menu_tools_loaded = true;

  function toast(msg) {
    try {
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(msg);
    } catch (e) {}
  }

  function isStr(v) {
    return typeof v === 'string' && v.trim().length > 0;
  }

  function safeRender(active) {
    try {
      if (active && active.activity && typeof active.activity.render === 'function') {
        return active.activity.render();
      }
    } catch (e) {}
    return null;
  }

  function getMovie(source) {
    return (
      (source && source.movie) ||
      (source && source.card) ||
      (source && source.data && source.data.movie) ||
      (source && source.object && source.object.card) ||
      null
    );
  }

  function getUrl(movie) {
    if (!movie) return '';
    const keys = [
      'MagnetUri',
      'magnet',
      'link',
      'url',
      'href',
      'torrent',
      'uri',
      'Link',
      'file',
      'download',
      'download_url'
    ];
    for (const k of keys) {
      try {
        const v = movie[k];
        if (isStr(v)) return String(v).trim();
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
      const t = document.createElement('textarea');
      t.value = text;
      t.setAttribute('readonly', 'true');
      t.style.position = 'fixed';
      t.style.left = '-9999px';
      document.body.appendChild(t);
      t.select();
      const ok = document.execCommand('copy');
      t.remove();
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
      return false;
    }
  }

  function openClient(url) {
    const clients = [
      'com.biglybt.android.client',
      'com.transmissionbt.android',
      'com.utorrent.client',
      'org.proninyaroslav.libretorrent',
      'com.delphicoder.flud'
    ];

    const tries = [];
    if (/^magnet:/i.test(url)) {
      for (const p of clients) {
        tries.push(`intent:${url}#Intent;scheme=magnet;pac