(function () {
  try {
    function log(msg) {
      try { console.log('[LAMPA-DIAG4]', msg); } catch (e) {}
      try {
        if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') {
          Lampa.Noty.show(msg);
        }
      } catch (e) {}
    }

    log('diag4 loaded');
    log('appready=' + String(window.appready));
    log('Lampa=' + String(!!window.Lampa));
    log('Listener=' + String(!!(window.Lampa && Lampa.Listener)));
    log('Activity=' + String(!!(window.Lampa && Lampa.Activity)));
    log('Noty=' + String(!!(window.Lampa && Lampa.Noty)));

    function run() {
      log('diag4 init');
      if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        Lampa.Listener.follow('full', function (e) {
          try {
            log('full type=' + (e && e.type ? e.type : 'no-type'));
            log('full keys=' + (e ? Object.keys(e).join(', ') : 'null'));
            log('data keys=' + (e && e.data ? Object.keys(e.data).join(', ') : 'null'));
            log('movie keys=' + (e && e.data && e.data.movie ? Object.keys(e.data.movie).join(', ') : 'null'));
          } catch (err) {
            log('full error=' + err);
          }
        });
      }
    }

    if (window.Lampa && window.appready) run();
    else document.addEventListener('lampa:init', run, { once: true });
  } catch (e) {
    try { console.log('[LAMPA-DIAG4 fatal]', e); } catch (_) {}
    try {
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') {
        Lampa.Noty.show('fatal ' + e);
      }
    } catch (_) {}
  }
})();