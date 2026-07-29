(function () {
  if (window.__lampa_diag_loaded) return;
  window.__lampa_diag_loaded = true;

  function out(msg) {
    try {
      console.log('[LAMPA-DIAG]', msg);
    } catch (e) {}
    try {
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(msg);
      else if (typeof alert === 'function') alert(msg);
    } catch (e) {}
  }

  function safeKeys(obj) {
    try {
      return obj ? Object.keys(obj).join(', ') : 'null';
    } catch (e) {
      return 'err';
    }
  }

  function run() {
    try {
      const info = [];
      info.push('appready=' + String(window.appready));
      info.push('Lampa=' + String(!!window.Lampa));
      info.push('Listener=' + String(!!(window.Lampa && Lampa.Listener)));
      info.push('Activity=' + String(!!(window.Lampa && Lampa.Activity)));
      info.push('Noty=' + String(!!(window.Lampa && Lampa.Noty)));
      info.push('LampaKeys=' + safeKeys(window.Lampa));
      out(info.join(' | '));

      if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        Lampa.Listener.follow('full', function (e) {
          try {
            console.log('[LAMPA-DIAG full]', e);
            const keys = safeKeys(e);
            const type = e && e.type ? e.type : 'no-type';
            const movieKeys = e && e.data && e.data.movie ? safeKeys(e.data.movie) : 'no-movie';
            out('full type=' + type + ' | keys=' + keys + ' | movieKeys=' + movieKeys);
          } catch (err) {
            console.log('[LAMPA-DIAG full error]', err);
          }
        });
      }
    } catch (e) {
      out('diag error: ' + e);
    }
  }

  if (window.Lampa && window.appready) run();
  else document.addEventListener('lampa:init', run, { once: true });
})();
