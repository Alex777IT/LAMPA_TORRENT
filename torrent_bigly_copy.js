(function () {
  try {
    function show(msg) {
      try { console.log('[LAMPA-ACTIVE]', msg); } catch (e) {}
      try {
        if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') {
          Lampa.Noty.show(msg);
        }
      } catch (e) {}
    }

    function keys(x) {
      try {
        return x ? Object.keys(x).join(', ') : 'null';
      } catch (e) {
        return 'err';
      }
    }

    function run() {
      show('active test start');
      show('appready=' + String(window.appready));
      show('Lampa=' + String(!!window.Lampa));
      show('Activity=' + String(!!(window.Lampa && Lampa.Activity)));

      try {
        const active = window.Lampa && Lampa.Activity && typeof Lampa.Activity.active === 'function'
          ? Lampa.Activity.active()
          : null;

        show('active=' + String(!!active));
        show('active keys=' + keys(active));
        show('active activity keys=' + keys(active && active.activity));
        show('active object keys=' + keys(active && active.object));
        show('active card keys=' + keys(active && active.card));
        show('active movie keys=' + keys(active && active.movie));
      } catch (e) {
        show('active error=' + e);
      }
    }

    if (window.Lampa && window.appready) run();
    else document.addEventListener('lampa:init', run, { once: true });
  } catch (e) {
    try { console.log('[LAMPA-ACTIVE fatal]', e); } catch (_) {}
  }
})();