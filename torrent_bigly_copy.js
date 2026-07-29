(function () {
  try {
    function safeKeys(x) {
      try {
        return x ? Object.keys(x).join(', ') : 'null';
      } catch (e) {
        return 'err';
      }
    }

    function safeType(x) {
      try {
        if (x === null) return 'null';
        if (x === undefined) return 'undefined';
        return typeof x;
      } catch (e) {
        return 'err';
      }
    }

    function show(msg) {
      try { console.log('[LAMPA-DIAG-FULL]', msg); } catch (e) {}
      try {
        if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') {
          Lampa.Noty.show(msg);
        }
      } catch (e) {}
    }

    function dump(name, obj) {
      show(name + ' type=' + safeType(obj) + ' keys=' + safeKeys(obj));
    }

    function inspectActive() {
      try {
        const active = window.Lampa && Lampa.Activity && typeof Lampa.Activity.active === 'function'
          ? Lampa.Activity.active()
          : null;

        dump('active', active);
        dump('active.activity', active && active.activity);
        dump('active.object', active && active.object);
        dump('active.card', active && active.card);
        dump('active.movie', active && active.movie);
        dump('active.data', active && active.data);
        dump('active.page', active && active.page);
        dump('active.view', active && active.view);
        dump('active.render', active && active.render);
        dump('active.activity.render', active && active.activity && active.activity.render);
      } catch (e) {
        show('inspectActive error=' + e);
      }
    }

    function inspectListeners() {
      try {
        dump('Lampa', window.Lampa);
        dump('Lampa.Listener', window.Lampa && Lampa.Listener);
        dump('Lampa.Activity', window.Lampa && Lampa.Activity);
        dump('Lampa.Noty', window.Lampa && Lampa.Noty);
      } catch (e) {
        show('inspectListeners error=' + e);
      }
    }

    function onInit() {
      show('diag full init');
      inspectListeners();
      inspectActive();

      try {
        if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
          Lampa.Listener.follow('full', function (e) {
            try {
              dump('full event', e);
              dump('event.type', e && e.type);
              dump('event.data', e && e.data);
              dump('event.data.movie', e && e.data && e.data.movie);
              dump('event.object', e && e.object);
              dump('event.object.card', e && e.object && e.object.card);
              dump('event.object.activity', e && e.object && e.object.activity);
            } catch (err) {
              show('full listener error=' + err);
            }
          });
        }
      } catch (e) {
        show('listener bind error=' + e);
      }

      setInterval(function () {
        try {
          inspectActive();
        } catch (e) {}
      }, 4000);
    }

    show('diag full loaded');
    show('appready=' + String(window.appready));

    if (window.Lampa && window.appready) onInit();
    else document.addEventListener('lampa:init', onInit, { once: true });
  } catch (e) {
    try { console.log('[LAMPA-DIAG-FULL fatal]', e); } catch (_) {}
    try {
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') {
        Lampa.Noty.show('fatal ' + e);
      }
    } catch (_) {}
  }
})();