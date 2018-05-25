(function () {
    window.addEventListener('DOMContentLoaded', function () {
        var isStreaming = true;
        var video = document.getElementById('video');
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var wsurl = 'ws://localhost:80/webrtc';

        if (!isStreaming) {
            signal(wsurl,
                    function (stream) {
                        console.log('got a stream!');
                        var url = window.URL || window.webkitURL;
                        video.src = url ? url.createObjectURL(stream) : stream;
                        video.play();
                    },
                    function (error) {
                        alert(error);
                    },
                    function () {
                        console.log('websocket closed. bye bye!');
                        video.src = '';
                    },
                    function (message) {
                        alert(message);
                    }
            );
        }

        // Wait until the video stream can play
        video.addEventListener('canplay', function () {
            if (!isStreaming) {
                isStreaming = true;
            }
        }, false);

        // Wait for the video to start to play
        video.addEventListener('play', function () {
            // Every 10 milliseconds copy the video image to the canvas
            setInterval(function () {
                if (video.paused || video.ended) {
                    return;
                }
                ctx.fillRect(0, 0, 450, 300);
                ctx.drawImage(video, 0, 0, 450, 300);
            }, 33);
        }, false);
    });
})();

$(function() {
    // Start a screen
    var patientID = $("#patientID").val();
    var odiv = document.getElementById('videoDiv');
    document.getElementById("btn_start").disabled = true;
    $.ajax({
        url: "/main/",
        type: "post",
        async: false,
        data: {
            'hitcount_pk': '1',
            'csrfmiddlewaretoken': getCookie('csrftoken'),
            'patientID': patientID,
            'type': 'check',
            'left': odiv.getBoundingClientRect().left,
            'top': odiv.getBoundingClientRect().top
        },
        success: function(status){
        }
    });

    $("#btn_check").click(function() {

    });

    $("#btn_start").click(function() {
        // Validate the position is OK
        var valpos = false;

        $.ajax({
            url: "/main/",
            type: "post",
            async: false,
            data: {'hitcount_pk': '1', 'csrfmiddlewaretoken': getCookie('csrftoken')},
            success: function(status){
                if(status == 'success') {
                    valpos = true;
                }
            }
        });

        // Show message
        if(valpos) {
            Ewin.confirm({ message: "Your position is OK, start testing now?" }).on(function (e) {
                if (!e) {
                    return;
                }

                document.getElementById("btn_start").disabled = true;
                // Changing image according interval time
                var t = 0;
                var interval = $("#interval").val();
                var remainSeconds = parseInt($("#remainSeconds").val()) * 60;
                var startTime = new Date().getTime();
                var intervalFuc = setInterval(function() {
                    switch (t%2){
                        case 0 : {
                            t = 1;
                            document.getElementById("image").src="/static/img/right.jpg";
                            break;
                        }
                        case 1 : {
                            t = 0;
                            document.getElementById("image").src="/static/img/left.jpg";
                            break;
                        }
                    }

                    if(new Date().getTime() - startTime >= remainSeconds * 1000) {
                        clearInterval(intervalFuc);

                        // Split video and upload images
                        $.ajax({
                                url: "/main/",
                                type: "post",
                                async: false,
                                data: {'hitcount_pk': '1', 'csrfmiddlewaretoken': getCookie('csrftoken')},
                                success: function(status){
                                    if(status == 'success') {
                                        Ewin.alert({ message: "Testing finish! Thanks for your using!" }).on(function (e) { });
                                        // Reset button and Testing time
                                        document.getElementById("btn_start").disabled = false;
                                        var newTime = padLeft($("#remainSeconds").val(), 2);
                                        $("#remainTime").html('<h2 class="text-left text-danger">Testing Time: ' + newTime + ':00' + '</h2>');
                                    }
                                }
                            });

                        return;
                    }
                }, interval * 1000);

                // Count Time
                SysSecond = parseInt($("#remainSeconds").val()) * 60;
                if (SysSecond != "" && !isNaN(SysSecond)) {
                    InterValObj = window.setInterval(SetRemainTime, 1000);
                }
            });
        } else {
            Ewin.alert({ message: "Your position is not OK, please move and start again" }).on(function (e) { });
        }
	});

    function SetRemainTime() {
        if (SysSecond > 0) {
            SysSecond = SysSecond - 1;
            var second = padLeft(Math.floor(SysSecond % 60), 2);
            var minite = padLeft(Math.floor((SysSecond / 60) % 60), 2);

            $("#remainTime").html('<h3 class="text-left text-danger">Testing Time: ' + minite + ':' + second + '</h3>');
        } else {
            window.clearInterval(InterValObj);
            // Upload
            document.getElementById("").click();
        }
    }

    function padLeft(str, lenght) {
        if (str.toString().length < lenght)
            return padLeft("0" + str, lenght);
        else
            return str;
    }

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});

(function ($) {
    window.Ewin = function () {
        var html = '<div id="[Id]" class="modal fade" role="dialog" aria-labelledby="modalLabel">' +
                              '<div class="modal-dialog modal-sm">' +
                                  '<div class="modal-content">' +
                                      '<div class="modal-header">' +
                                          '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
                                          '<h4 class="modal-title" id="modalLabel">[Title]</h4>' +
                                      '</div>' +
                                      '<div class="modal-body">' +
                                      '<p>[Message]</p>' +
                                      '</div>' +
                                       '<div class="modal-footer">' +
        '<button type="button" class="btn btn-default cancel" data-dismiss="modal">[BtnCancel]</button>' +
        '<button type="button" class="btn btn-primary ok" data-dismiss="modal">[BtnOk]</button>' +
    '</div>' +
                                  '</div>' +
                              '</div>' +
                          '</div>';


        var dialogdHtml = '<div id="[Id]" class="modal fade" role="dialog" aria-labelledby="modalLabel">' +
                              '<div class="modal-dialog">' +
                                  '<div class="modal-content">' +
                                      '<div class="modal-header">' +
                                          '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
                                          '<h4 class="modal-title" id="modalLabel">[Title]</h4>' +
                                      '</div>' +
                                      '<div class="modal-body">' +
                                      '</div>' +
                                  '</div>' +
                              '</div>' +
                          '</div>';
        var reg = new RegExp("\\[([^\\[\\]]*?)\\]", 'igm');
        var generateId = function () {
            var date = new Date();
            return 'mdl' + date.valueOf();
        }
        var init = function (options) {
            options = $.extend({}, {
                title: "Message",
                message: "Title",
                btnok: "Confirm",
                btncl: "Cancel",
                width: 300,
                auto: false
            }, options || {});
            var modalId = generateId();
            var content = html.replace(reg, function (node, key) {
                return {
                    Id: modalId,
                    Title: options.title,
                    Message: options.message,
                    BtnOk: options.btnok,
                    BtnCancel: options.btncl
                }[key];
            });
            $('body').append(content);
            $('#' + modalId).modal({
                width: options.width,
                backdrop: 'static'
            });
            $('#' + modalId).on('hide.bs.modal', function (e) {
                $('body').find('#' + modalId).remove();
            });
            return modalId;
        }

        return {
            alert: function (options) {
                if (typeof options == 'string') {
                    options = {
                        message: options
                    };
                }
                var id = init(options);
                var modal = $('#' + id);
                modal.find('.ok').removeClass('btn-success').addClass('btn-primary');
                modal.find('.cancel').hide();

                return {
                    id: id,
                    on: function (callback) {
                        if (callback && callback instanceof Function) {
                            modal.find('.ok').click(function () { callback(true); });
                        }
                    },
                    hide: function (callback) {
                        if (callback && callback instanceof Function) {
                            modal.on('hide.bs.modal', function (e) {
                                callback(e);
                            });
                        }
                    }
                };
            },
            confirm: function (options) {
                var id = init(options);
                var modal = $('#' + id);
                modal.find('.ok').removeClass('btn-primary').addClass('btn-success');
                modal.find('.cancel').show();
                return {
                    id: id,
                    on: function (callback) {
                        if (callback && callback instanceof Function) {
                            modal.find('.ok').click(function () { callback(true); });
                            modal.find('.cancel').click(function () { callback(false); });
                        }
                    },
                    hide: function (callback) {
                        if (callback && callback instanceof Function) {
                            modal.on('hide.bs.modal', function (e) {
                                callback(e);
                            });
                        }
                    }
                };
            },
            dialog: function (options) {
                options = $.extend({}, {
                    title: 'title',
                    url: '',
                    width: 800,
                    height: 550,
                    onReady: function () { },
                    onShown: function (e) { }
                }, options || {});
                var modalId = generateId();

                var content = dialogdHtml.replace(reg, function (node, key) {
                    return {
                        Id: modalId,
                        Title: options.title
                    }[key];
                });
                $('body').append(content);
                var target = $('#' + modalId);
                target.find('.modal-body').load(options.url);
                if (options.onReady())
                    options.onReady.call(target);
                target.modal();
                target.on('shown.bs.modal', function (e) {
                    if (options.onReady(e))
                        options.onReady.call(target, e);
                });
                target.on('hide.bs.modal', function (e) {
                    $('body').find(target).remove();
                });
            }
        }
    }();
})(jQuery);