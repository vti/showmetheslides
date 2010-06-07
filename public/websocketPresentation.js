(function($){
    $.fn.extend({
        websocketPresentation: function(options) {
            var presentation = this;

            var defaults = {};

            var options = $.extend(defaults, options);

            this.displayMessage = function (msg) {
                $(this).html(msg);
            };

            return this.each(function() {
                var html = this;
                var o = options;

                presentation.displayMessage('Connecting...');

                var ws = new WebSocket(o.url);

                ws.onerror = function(e) {
                    presentation.displayMessage("Error: " + e);
                };

                ws.onopen = function() {
                    presentation.displayMessage('Connected. Loading...');

                    presentation.html('');
                };

                ws.onmessage = function(e) {
                    var data = $.evalJSON(e.data);

                    if (data.type == 'slide') {
                        $(html).fadeOut(500, function() {
                            presentation.displayMessage(data.content);
                            $(html).fadeIn(500);
                        });
                    }
                    else if (data.type == 'status') {
                        if (data.clients) {
                            $('#websocket-presentation-clients').html(data.clients);
                        }
                        if (data.current != null) {
                            $('#websocket-presentation-current').html(data.current);
                        }
                        if (data.total) {
                            $('#websocket-presentation-total').html(data.total);
                        }
                    }
                };

                ws.onclose = function() {
                    presentation.displayMessage('Disconnected. <a href="/">Reconnect</a>');
                };

                if (o.speaker) {
                    $(document).keydown(function(e) {
                        var code = (e.keyCode ? e.keyCode : e.which);

                        // Right Arrow or Space
                        if (code == '39' || code == '32') {
                            ws.send($.toJSON({"action":"next"}));
                        }

                        // Left Arrow
                        else if (code == '37') {
                            ws.send($.toJSON({"action":"prev"}));
                        }

                        // Home
                        else if (code == '36') {
                            ws.send($.toJSON({"action":"first"}));
                        }

                        // End
                        else if (code == '35') {
                            ws.send($.toJSON({"action":"last"}));
                        }
                    });
                }
            });
        }
    });
})(jQuery);
