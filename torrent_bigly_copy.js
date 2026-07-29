(function () {
  try {
    function show(msg) {
      try { console.log('[LAMPA-DIAG3]', msg); } catch (e) {}
      try {
        if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') {
          Lampa.Noty.show(msg);
        }
      } catch (e) {}
    }

    function big(msg) {
      try {
        let el = document.getElementById('lampa-diag3-box');
        if (!el) {
          el = document.createElement('div');
          el.id = 'lampa-diag3-box';
          el.style.position = 'fixed';
          el.style.left = '20px';
          el.style.right = '20px';
          el.style.bottom = '20px';
          el.style.zIndex = '999999';
          el.style.background = 'rgba(0, 0, 0, 0.85)';
          el.style.color = '#00ff7f';
          el.style.padding = '16px';
          el.style.borderRadius = '12px';
          el.style.fontSize = '22px';
          el.style.lineHeight = '1.4';
          el.style.fontFamily = 'monospace';
          el.style.whiteSpace = 'pre-wrap';
          document.body.appendChild(el);
        }
        el.textContent = msg;
        clearTimeout(window.__lampa_diag3_timer);
        window.__lampa_diag3_timer = setTimeout(function () {
          try { el.remove(); } catch (e) {}
        }, 30000);
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
      const lines = [];
      lines.push('diag3 loaded');
      lines.push('appready=' + String(window.appready));
      lines.push('Lampa=' + String(!!window.Lampa));
      lines.push('Listener=' + String(!!(window.Lampa && Lampa.Listener)));
      lines.push('Activity=' + String(!!(window.Lampa && Lampa.Activity)));
      lines.push('Noty=' + String(!!(window.Lampa && Lampa.Noty)));
      const text = lines.join('
');
      show(text);
      big(text);

      if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        Lampa.Listener.follow('full', function (e) {
          try {
            const out = [
              'full event',
              'type=' + (e && e.type ? e.type : 'no-type'),
              'keys=' + keys(e),
              'data keys=' + keys(e && e.data),
              'movie keys=' + keys(e && e.data && e.data.movie),
              'object keys=' + keys(e && e.object),
              'card keys=' + keys(e && e.object && e.object.card)
            ].join('
');
            show(out);
            big(out);
            console.log('[LAMPA-DIAG3 full]', e);
          } catch (err) {
            show('full error ' + err);
            big('full error ' + err);
          }
        });
      }
    }

    if (window.Lampa && window.appready) run();
    else document.addEventListener('lampa:init', run, { once: true });
  } catch (e) {
    try { console.log('[LAMPA-DIAG3 fatal]', e); } catch (_) {}
  }
})();