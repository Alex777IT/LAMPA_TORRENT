(function () {
    'use strict';

    if (window.__torrent_link_tools_loaded) return;
    window.__torrent_link_tools_loaded = true;

    var TRANSMISSION_PACKAGE = 'com.ap.transmission.btc'; // Transmission BTC для Android

    // --- Копирование в буфер обмена ---
    function copyToClipboard(text, done) {
        var ok = false;
        try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', 'true');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            ta.style.top = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            ok = document.execCommand('copy');
            document.body.removeChild(ta);
        } catch (e) {
            ok = false;
        }
        if (ok) return done(true);
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () { done(false); });
            return;
        }
        done(false);
    }

    function showLinkModal(link) {
        Lampa.Modal.open({
            title: 'Ссылка на раздачу',
            html: $('<div style="padding:1em;word-break:break-all;line-height:1.5;">' + link + '</div>'),
            size: 'large',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('content');
            }
        });
    }

    // --- QR-код (пригодится, если когда-нибудь понадобится передать ссылку на другое устройство) ---
    function showQr(link) {
        var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=' + encodeURIComponent(link);
        var html = $(
            '<div style="padding:1.5em;text-align:center;">' +
                '<img src="' + qrUrl + '" style="width:350px;height:350px;background:#fff;padding:10px;border-radius:8px;" />' +
                '<div style="margin-top:1em;font-size:1.1em;">Наведи камеру телефона на код</div>' +
            '</div>'
        );
        Lampa.Modal.open({
            title: 'QR-код раздачи',
            html: html,
            size: 'large',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('content');
            }
        });
    }

    // --- Открыть magnet-ссылку в Transmission BTC (на этом же устройстве, через Android-intent) ---
    function openInTransmission(link, done) {
        try {
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'intent:' + link.replace(/^magnet:/i, '') +
                '#Intent;scheme=magnet;package=' + TRANSMISSION_PACKAGE + ';action=android.intent.action.VIEW;end';
            document.body.appendChild(iframe);
            setTimeout(function () {
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
            }, 2000);
            done(true);
        } catch (e) {
            done(false, 'Не удалось вызвать intent на этой платформе');
        }
    }

    // --- Реальное скачивание .torrent-файла на диск ТВ ---
    // Работает только для настоящих http(s)-ссылок на файл (не magnet).
    // Используем стандартный приём с <a download>: большинство Android-приложений
    // на WebView перехватывают такую загрузку через системный DownloadManager,
    // и файл сохраняется в папку загрузок устройства.
    function downloadTorrentFile(link, title, done) {
        try {
            var filename = (title || 'torrent').replace(/[\\/:*?"<>|]+/g, '_').trim() + '.torrent';
            var a = document.createElement('a');
            a.href = link;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                if (a.parentNode) a.parentNode.removeChild(a);
            }, 2000);
            done(true);
        } catch (e) {
            done(false);
        }
    }

    Lampa.Listener.follow('torrent', function (e) {
        if (e.type !== 'render') return;

        var item = e.item;
        var element = e.element;

        item.off('hover:long');

        item.on('hover:long', function () {
            var enabled = Lampa.Controller.enabled().name;
            var link = (element.MagnetUri || element.Link || '').trim();
            var isMagnet = /^magnet:/i.test(link);

            var menu = [];

            if (isMagnet) {
                menu.push({ title: 'Открыть в Transmission BTC', opentr: true });
            } else if (link) {
                menu.push({ title: 'Скачать .torrent файл на ТВ', download: true });
            }

            menu.push({ title: 'Показать QR-код', showqr: true });
            menu.push({ title: 'Скопировать ссылку', copylink: true });

            Lampa.Select.show({
                title: 'Действие с раздачей',
                items: menu,
                onBack: function () {
                    Lampa.Controller.toggle(enabled);
                },
                onSelect: function (a) {
                    if (!link) {
                        Lampa.Noty.show('У этой раздачи нет ссылки');
                        Lampa.Controller.toggle(enabled);
                        return;
                    }

                    if (a.opentr) {
                        openInTransmission(link, function (ok, msg) {
                            if (ok) Lampa.Noty.show('Передаю ссылку в Transmission BTC...');
                            else Lampa.Noty.show(msg || 'Не получилось открыть');
                        });
                        Lampa.Controller.toggle(enabled);
                    } else if (a.download) {
                        downloadTorrentFile(link, element.Title, function (ok) {
                            Lampa.Noty.show(ok ? 'Загрузка .torrent файла начата' : 'Не удалось начать загрузку');
                        });
                        Lampa.Controller.toggle(enabled);
                    } else if (a.showqr) {
                        showQr(link); // сам вызовет toggle через onBack модалки
                    } else if (a.copylink) {
                        copyToClipboard(link, function (ok) {
                            if (ok) Lampa.Noty.show('Ссылка скопирована в буфер обмена');
                            else showLinkModal(link);
                        });
                        Lampa.Controller.toggle(enabled);
                    } else {
                        Lampa.Controller.toggle(enabled);
                    }
                }
            });
        });
    });
})();
