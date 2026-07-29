(function () {
  if (window.__lampa_extra_button_final) return;
  window.__lampa_extra_button_final = true;

  function safeToast(msg) {
    try {
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(msg);
    } catch (e) {}
  }

  function addButton(opts) {
    try {
      if (!opts || !opts.render || !opts.render.length) return;
      if (opts.render.find('.lampa-extra-final-btn').length) return;

      var btn = $('<div/>', {
        class: 'lampa-extra-final-btn',
        text: 'Тест',
        click: function () {
          safeToast('Кнопка нажата');
        }
      });

      btn.css({
        display: 'inline-block',
        padding: '12px 16px',
        margin: '0 0 0 10px',
        borderRadius: '10px',
        background: '#e11d48',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer'
      });

      opts.render.append(btn);
      safeToast('Кнопка добавлена');
    } catch (e) {}
  }

  function startPlugin() {
    try {
      if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        Lampa.Listener.follow('full', function (e) {
          try {
            if (e && e.type == 'complite') {
              addButton({
                render: e.object.activity.render().find('.view--torrent'),
                movie: e.data.movie
              });
            }
          } catch (err) {}
        });
      }
    } catch (e) {}

    try {
      if (window.Lampa && Lampa.Activity && typeof Lampa.Activity.active === 'function') {
        var active = Lampa.Activity.active();
        if (active && active.component == 'full') {
          addButton({
            render: active.activity.render().find('.view--torrent'),
            movie: active.card
          });
        }
      }
    } catch (e) {}
  }

  if (window.Lampa && window.appready) startPlugin();
  else document.addEventListener('lampa:init', startPlugin, { once: true });
})();