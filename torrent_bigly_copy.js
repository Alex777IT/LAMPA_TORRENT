(function () {
    'use strict';

    if (window.__torrent_link_tools_loaded) return;
    window.__torrent_link_tools_loaded = true;

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

    // === BiglyBT RPC (экспериментально) ===
    // BiglyBT для Android умеет поднимать Transmission-RPC-совместимый
    // интерфейс через "Allow Remote Control on LAN" в своих настройках.
    // Адрес не зашит в код — вводится один раз через это поле и хранится
    // в Lampa.Storage, переживает перезапуск приложения.
    var BIGLY_STORAGE_KEY = 'biglybt_rpc_address';

    function getBiglyAddress() {
        return Lampa.Storage.get(BIGLY_STORAGE_KEY, '');
    }

    function setBiglyAddress(value) {
        Lampa.Storage.set(BIGLY_STORAGE_KEY, value);
    }

    function askBiglyAddress(callback) {
        var current = getBiglyAddress();

        Lampa.Input.edit({
            title: 'Адрес BiglyBT (IP:порт)',
            value: current,
            nosave: true
        }, function (value) {
            value = (value || '').trim();
            if (value) setBiglyAddress(value);
            if (callback) callback(value);
        });
    }

    // Отправка запроса в стиле Transmission RPC через Lampa.Reguest —
    // на Android эта штатная сетевая утилита сама уходит через нативный
    // HTTP-клиент (Android.httpReq), в обход WebView и блокировки
    // приватных IP, с которой мы упирались через обычный fetch/XHR.
    // ЭКСПЕРИМЕНТАЛЬНО: не проверено на 100%, работает ли проброс
    // заголовков (нужен X-Transmission-Session-Id) через эту обёртку —
    // тестируем и смотрим консоль Lampa, если не сработает.
    function biglyRpcCall(address, body, sessionId, onSuccess, onError) {
        var url = 'http://' + address + '/transmission/rpc';
        var network = new Lampa.Reguest();

        var headers = { 'Content-Type': 'application/json' };
        if (sessionId) headers['X-Transmission-Session-Id'] = sessionId;

        network.timeout(8000);
        network.silent(url, function (response, xhr) {
            onSuccess(response, xhr);
        }, function (xhr) {
            // 409 — нужно забрать session-id из заголовка и повторить запрос
            var newSessionId = xhr && xhr.getResponseHeader
                ? xhr.getResponseHeader('X-Transmission-Session-Id')
                : null;

            if (xhr && xhr.status === 409 && newSessionId && !sessionId) {
                biglyRpcCall(address, body, newSessionId, onSuccess, onError);
            } else {
                onError(xhr);
            }
        }, false, {
            method: 'POST',
            headers: headers,
            dataType: 'json',
            postData: JSON.stringify(body)
        });
    }

    function addToBiglyBT(link, title, done) {
        var address = getBiglyAddress();

        if (!address) {
            askBiglyAddress(function (value) {
                if (value) addToBiglyBT(link, title, done);
                else done(false, 'Адрес не задан');
            });
            return;
        }

        var body = { method: 'torrent-add', arguments: { filename: link } };

        biglyRpcCall(address, body, null, function (response) {
            if (response && response.result === 'success') {
                done(true);
            } else {
                done(false, 'BiglyBT ответил, но без успеха: ' + JSON.stringify(response));
            }
        }, function (xhr) {
            done(false, 'Ошибка запроса к BiglyBT (см. консоль Lampa): ' + (xhr && xhr.status));
        });
    }

    Lampa.Listener.follow('torrent', function (e) {
        if (e.type !== 'render') return;

        var item = e.item;
        var element = e.element;

        item.off('hover:long');

        item.on('hover:long', function () {
            var enabled = Lampa.Controller.enabled().name;

            // Проверяем оба поля НЕЗАВИСИМО — у многих раздач одновременно есть
            // и magnet, и прямая ссылка на .torrent-файл. Раньше magnet
            // перекрывал проверку и пункт скачивания пропадал почти всегда.
            var magnetLink = (element.MagnetUri || '').trim();
            var fileLink = (element.Link || '').trim();
            var isFileLinkMagnet = /^magnet:/i.test(fileLink);

            // Для QR и копирования показываем то, что реально доступно:
            // приоритет magnet (универсальнее для сканирования телефоном),
            // иначе — прямая ссылка.
            var link = magnetLink || fileLink;

            // Пункт скачивания показываем, только если fileLink — настоящая
            // http(s)-ссылка на файл, а не ещё один magnet под тем же полем.
            var canDownload = fileLink && !isFileLinkMagnet && /^https?:/i.test(fileLink);

            var menu = [];

            if (magnetLink) {
                menu.push({ title: 'Добавить в BiglyBT', addbt: true });
            }

            if (canDownload) {
                menu.push({ title: 'Скачать .torrent файл на ТВ', download: true });
            }

            menu.push({ title: 'Показать QR-код', showqr: true });
            menu.push({ title: 'Скопировать ссылку', copylink: true });
            menu.push({ title: 'Настроить BiglyBT (IP:порт)', configbt: true });

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

                    if (a.addbt) {
                        addToBiglyBT(magnetLink, element.Title, function (ok, msg) {
                            Lampa.Noty.show(ok ? 'Добавлено в BiglyBT' : (msg || 'Не получилось добавить'));
                        });
                        Lampa.Controller.toggle(enabled);
                    } else if (a.configbt) {
                        askBiglyAddress(function (value) {
                            Lampa.Noty.show(value ? 'Адрес BiglyBT сохранён' : 'Отменено');
                        });
                        return; // Input сам управляет контроллером
                    } else if (a.download) {
                        downloadTorrentFile(fileLink, element.Title, function (ok) {
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
