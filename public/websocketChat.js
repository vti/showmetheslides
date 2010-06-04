(function($){
    $.fn.extend({
        websocketChat: function(options) {
            var chat = this;

            var defaults = {
            }

            var options = $.extend(defaults, options);

            this.displayMessage = function (msg) {
                $(this).html(msg);
            };

            this.toUTF = function toUTF(string) {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "";

                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);

                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    }
                    else if((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                    else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }

                return utftext;
            };

            return this.each(function() {
                var o = options;

                chat.displayMessage('Connecting...');

                // Connect to WebSocket
                var ws = new WebSocket(o.url);

                ws.onerror = function(e) {
                    chat.displayMessage("Error: " + e);
                };

                ws.onopen = function() {
                    chat.displayMessage('Connected. Loading...');

                    chat.html('');
                    chat.append('<div id="websocket-chat"></div>');
                    $('#websocket-chat').append('<pre id="websocket-chat-log"></pre>');

                    $('#websocket-chat').append('<form id="websocket-chat-form"><input id="websocket-chat-input" /></form>');

                    $('#websocket-chat-input').bind('keypress', function(e) {
                        e.stopPropagation();
                    });

                    $('#websocket-chat-input').bind('keydown', function(e) {
                        e.stopPropagation();
                    });

                    $('#websocket-chat-form').submit(function() {
                        var message = $('#websocket-chat-input').val().substring(0, 140);
                        $('#websocket-chat-input').val('');
                        if (message && message != '') {
                            if (window.chrome) {
                                ws.send($.toJSON({"text" : message}));
                            }
                            else {
                                ws.send($.toJSON({"text" : chat.toUTF(message)}));
                            }
                        }
                        return false;
                    });
                };

                ws.onmessage = function(e) {
                    var data = $.evalJSON(e.data);

                    if (data.text) {
                        var log = $('#websocket-chat-log');
                        if (data.nick) {
                            if (data.me) {
                                log.append('* ' + data.nick + ' ' + data.text + "\n");
                            }
                            else {
                                log.append('> ' + data.nick + ': ' + data.text + "\n");
                            }
                        }
                        else {
                            log.html(log.html() + '! ' + data.text + "\n");
                        }
                        log.animate({scrollTop: log[0].scrollHeight});
                    }
                };

                ws.onclose = function() {
                    chat.displayMessage('Disconnected. <a href="/">Reconnect</a>');
                }
            });
        }
    });
})(jQuery);
