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
        tries.push(`intent:${url}#Intent;scheme=magnet;package=${p};action=android.intent.action.VIEW;end`);
      }
      tries.push(url);
    } else {
      for (const p of clients) {
        tries.push(`intent://${encodeURIComponent(url)}#Intent;package=${p};action=android.intent.action.VIEW;end`);
      }
      tries.push(url);
    }

    for (const u of tries) {
      try {
        window.location.href = u;
        return true;
      } catch (e) {}
    }
    return false;
  }

  function makeBox(url) {
    const root = document.createElement('div');
    root.className = 'torrent_menu_tools_box';
    root.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;margin:12px 0;padding:12px;border-radius:12px;background:rgba(0,0,0,.55);';

    function addBtn(text, bg, fn) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.style.cssText = `padding:14px 18px;border:0;border-radius:10px;background:${bg};color:#fff;font-size:16px;font-weight:600;`;
      b.addEventListener('click', fn);
      root.appendChild(b);
    }

    addBtn('Скопировать ссылку', '#2d6cdf', function () {
      toast(copyText(url) ? 'Ссылка скопирована' : 'Не удалось скопировать');
    });

    addBtn('Открыть в браузере', '#16a34a', function () {
      toast(openBrowser(url) ? 'Открываю браузер' : 'Не удалось открыть браузер');
    });

    addBtn('Открыть в торрент-клиенте', '#d97706', function () {
      toast(openClient(url) ? 'Открываю торрент-клиент' : 'Не удалось открыть торрент-клиент');
    });

    return root;
  }

  function inject(renderRoot, movie) {
    try {
      if (!renderRoot || !movie) return false;
      if (renderRoot.querySelector && renderRoot.querySelector('.torrent_menu_tools_box')) return true;

      const url = getUrl(movie);
      if (!url) return false;

      const target =
        (renderRoot.querySelector && (
          renderRoot.querySelector('.view--torrent') ||
          renderRoot.querySelector('.view--actions') ||
          renderRoot.querySelector('.full--buttons')
        )) || renderRoot;

      if (!target || !target.appendChild) return false;

      target.appendChild(makeBox(url));
      toast('Пункты добавлены');
      return true;
    } catch (e) {
      return false;
    }
  }

  function tryInjectFromActive() {
    try {
      const active = window.Lampa && Lampa.Activity && typeof Lampa.Activity.active === 'function'
        ? Lampa.Activity.active()
        : null;

      if (!active || active.component !== 'full') return false;

      const renderRoot = safeRender(active);
      const movie = getMovie(active);
      return inject(renderRoot, movie);
    } catch (e) {
      return false;
    }
  }

  function start() {
    toast('Плагин подключён');

    tryInjectFromActive();

    try {
      if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        Lampa.Listener.follow('full', function (e) {
          try {
            if (e && e.type === 'complite') {
              const renderRoot = e.object && e.object.activity && typeof e.object.activity.render === 'function'
                ? e.object.activity.render()
                : null;
              const movie = getMovie(e.data || {});
              if (renderRoot && movie) inject(renderRoot, movie);
            }
          } catch (err) {}
        });
      }
    } catch (e) {}

    setInterval(tryInjectFromActive, 1500);
  }

  if (window.Lampa && window.appready) start();
  else document.addEventListener('lampa:init', start, { once: true });
})();