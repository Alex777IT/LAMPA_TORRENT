(function () {
  try {
    function show(msg) {
      try {
        console.log('[LAMPA-DIAG2]', msg);
      } catch (e) {}
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

    show('diag2 loaded');
    show('Lampa=' + String(!!window.Lampa) + ' appready=' + String(window.appready));

    function run() {
      show('diag2 init');
      if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        Lampa.Listener.follow('full', function (e) {
          try {
            console.log('[LAMPA-DIAG2 full]', e);
            show('full type=' + (e && e.type ? e.type : 'no-type'));
            show('full keys=' + keys(e));
            show('data keys=' + keys(e && e.data));
            show('movie keys=' + keys(e && e.data && e.data.movie));
            show('object keys=' + keys(e && e.object));
            show('card keys=' + keys(e && e.object && e.object.card));
          } catch (err) {
            show('full error ' + err);
          }
        });
      }
    }

    if (window.Lampa && window.appready) run();
    else document.addEventListener('lampa:init', run, { once: true });
  } catch (e) {
    try { console.log('[LAMPA-DIAG2 fatal]', e); } catch (_) {}
  }
})();