(function () {
  if (window.__torrent_menu_visible_test) return;
  window.__torrent_menu_visible_test = true;

  function toast(msg) {
    try {
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(msg);
    } catch (e) {}
  }

  function getActive() {
    try {
      return window.Lampa && Lampa.Activity && typeof Lampa.Activity.active === 'function'
        ? Lampa.Activity.active()
        : null;
    } catch (e) {
      return null;
    }
  }

  function safeRender(active) {
    try {
      return active && active.activity && typeof active.activity.render === 'function'
        ? active.activity.render()
        : null;
    } catch (e) {
      return null;
    }
  }

  function makeButton() {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'Тест кнопка';
    b.className = 'torrent_menu_visible_test_btn';
    b.style.cssText = 'padding:14px 18px;border:0;border-radius:10px;background:#e11d48;color:#fff;font-size:16px;font-weight:700;margin:12px 0;';
    b.onclick = function () {
      toast('Кнопка нажата');
    };
    return b;
  }

  function inject() {
    try {
      const active = getActive();
      if (!active || active.component !== 'full') return false;

      const root = safeRender(active);
      if (!root || !root.querySelector) return false;

      if (root.querySelector('.torrent_menu_visible_test_btn')) return true;

      const anchors = [
        root.querySelector('.view--torrent'),
        root.querySelector('.view--actions'),
        root.querySelector('.full--buttons'),
        root.querySelector('div'),
        root
      ];

      let target = null;
      for (const a of anchors) {
        if (a && a.appendChild) {
          target = a;
          break;
        }
      }

      if (!target) return false;

      target.appendChild(makeButton());
      toast('Тестовая кнопка добавлена');
      return true;
    } catch (e) {
      return false;
    }
  }

  function start() {
    toast('Тестовый плагин запущен');
    inject();
    setInterval(inject, 1200);
  }

  if (window.Lampa && window.appready) start();
  else document.addEventListener('lampa:init', start, { once: true });
})();