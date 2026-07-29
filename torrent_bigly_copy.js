(function () {
  if (window.__torrent_menu_actions_loaded) return;
  window.__torrent_menu_actions_loaded = true;

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
    b.textContent = 'Тест';
    b.className = 'torrent_menu_action_test_btn';
    b.style.cssText = 'padding:14px 18px;border:0;border-radius:10px;background:#e11d48;color:#fff;font-size:16px;font-weight:700;margin:0 0 0 10px;';
    b.onclick = function () {
      toast('Кнопка нажата');
    };
    return b;
  }

  function findTarget(root) {
    if (!root || !root.querySelector) return null;
    return (
      root.querySelector('.view--actions') ||
      root.querySelector('.view--torrent') ||
      root.querySelector('.full--buttons') ||
      root.querySelector('.full__buttons') ||
      root.querySelector('.buttons') ||
      root.querySelector('[class*="button"]') ||
      null
    );
  }

  function inject() {
    try {
      const active = getActive();
      if (!active || active.component !== 'full') return false;

      const root = safeRender(active);
      if (!root || !root.querySelector) return false;

      if (root.querySelector('.torrent_menu_action_test_btn')) return true;

      const target = findTarget(root) || root;
      if (!target || !target.appendChild) return false;

      target.appendChild(makeButton());
      toast('Тестовая кнопка добавлена');
      return true;
    } catch (e) {
      return false;
    }
  }

  function start() {
    toast('Плагин запущен');
    inject();
    setInterval(inject, 1000);
  }

  if (window.Lampa && window.appready) start();
  else document.addEventListener('lampa:init', start, { once: true });
})();