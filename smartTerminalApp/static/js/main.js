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
    var odiv = document.getElementById('videoDiv');
    // Validate the position is OK
    var valpos = false;
    var fileName = '';

    $.ajax({
        url: '/main/',
        type: 'post',
        async: true,
        data: {
            'hitcount_pk': '1',
            'csrfmiddlewaretoken': getCookie('csrftoken'),
            'patientID': $('#patientID').val(),
	    'remainSeconds': $('#remainSeconds').val(),
            'type': 'init',
            'left': parseInt(getAbsPosition(odiv).x),
            'top': parseInt(getAbsPosition(odiv).y)
        },
        success: function(){
        }
    });

    $('#btn_start').click(function() {
        $.ajax({
            url: '/main/',
            type: 'post',
            async: false,
            data: {
                'hitcount_pk': '1',
                'csrfmiddlewaretoken': getCookie('csrftoken'),
                'patientID': $('#patientID').val(),
		'remainSeconds': $('#remainSeconds').val(),
                'type': 'check'
            },
            success: function(data){
		// Check success, 
		if(data != null) {
		    valpos = true;
		    fileName = data;
		}
            }
        });

        // Show message
        if(valpos) {
            Ewin.confirm({ message: 'Your position is OK, start testing now?' }).on(function (e) {
                if (!e) {
                    return;
                }
		
		// Disable start button
                document.getElementById('btn_start').disabled = true;

		// Start record video
	        $.ajax({
	            url: '/main/',
	            type: 'post',
	            async: true,
	            data: {
	                'hitcount_pk': '1',
	                'csrfmiddlewaretoken': getCookie('csrftoken'),
	                'patientID': $('#patientID').val(),
			'remainSeconds': $('#remainSeconds').val(),
	                'type': 'test',
			'fileName': fileName
	            },
	            success: function(data){
			fileName = data;
	            }
        	});

                // Changing image according interval time
                var t = 0;
                var interval = $('#interval').val();
                var remainSeconds = parseInt($('#remainSeconds').val()) * 60;
                var startTime = new Date().getTime();
                var intervalFuc = setInterval(function() {
                    switch (t%2){
                        case 0 : {
                            t = 1;
                            document.getElementById('image').src="/static/img/right.jpg";
                            break;
                        }
                        case 1 : {
                            t = 0;
                            document.getElementById('image').src="/static/img/left.jpg";
                            break;
                        }
                    }

                    // if(new Date().getTime() - startTime >= remainSeconds * 1000) {
		    if(new Date().getTime() - startTime >= 10 * 1000) {
                        clearInterval(intervalFuc);

                        // Split video and upload images
		        $.ajax({
		            url: '/main/',
		            type: 'post',
		            async: true,
		            data: {
		                'hitcount_pk': '1',
		                'csrfmiddlewaretoken': getCookie('csrftoken'),
		                'patientID': $('#patientID').val(),
				'remainSeconds': $('#remainSeconds').val(),
		                'type': 'upload',
				'fileName': fileName
		            },
		            success: function(status){
				if(status == 'success') {
				    Ewin.alert({ message: 'Testing finish! Thanks for your using!' }).on(function (e) { });
                                    // Reset button and Testing time
                                    document.getElementById('btn_start').disabled = false;
                                    var newTime = padLeft($("#remainSeconds").val(), 2);
                                    $("#remainTime").html('<h2 class="text-left text-danger">Testing Time: ' + newTime + ':00' + '</h2>');
				}
		            }
        		});

                        return;
                    }
                }, interval * 1000);

                // Count Time
                SysSecond = parseInt($('#remainSeconds').val()) * 60;
                if (SysSecond != "" && !isNaN(SysSecond)) {
                    InterValObj = window.setInterval(SetRemainTime, 1000);
                }
            });
        } else {
            Ewin.alert({ message: 'Your position is not OK, please move and start again' }).on(function (e) { });
        }
    });

    function getAbsPosition(element)  
    {  
        var abs={x:0,y:0}  
      
        if(document.documentElement.getBoundingClientRect) {                
            abs.x = element.getBoundingClientRect().left;           
            abs.y = element.getBoundingClientRect().top;  
          
            abs.x += window.screenLeft +    
                        document.documentElement.scrollLeft -              
                        document.documentElement.clientLeft;  
            abs.y += window.screenTop +    
                        document.documentElement.scrollTop -    
                        document.documentElement.clientTop;        
        }else {  
            while(element!=document.body) {  
                abs.x+=element.offsetLeft;  
                abs.y+=element.offsetTop;  
                element=element.offsetParent;  
            }  
          
         abs.x += window.screenLeft +   
                document.body.clientLeft - document.body.scrollLeft;  
         abs.y += window.screenTop +   
                document.body.clientTop - document.body.scrollTop;    
        }  
      
        return abs;  
    }  

    function SetRemainTime() {
        if (SysSecond > 0) {
            SysSecond = SysSecond - 1;
            var second = padLeft(Math.floor(SysSecond % 60), 2);
            var minite = padLeft(Math.floor((SysSecond / 60) % 60), 2);

            $("#remainTime").html('<h3 class="text-left text-danger">Testing Time: ' + minite + ':' + second + '</h3>');
        } else {
            window.clearInterval(InterValObj);
            // Upload
            document.getElementById('').click();
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
        var html = '<div id="[Id]" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">' +
                              '<div class="modal-dialog">' +
                                  '<div class="modal-content">' +
                                      '<div class="modal-header">' +
                                          '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">' +
					  '&times;</button>' +
                                          '<h6 class="modal-title" id="modalLabel">[Title]</h6>' +
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

        var reg = new RegExp("\\[([^\\[\\]]*?)\\]", 'igm');
        var generateId = function () {
            var date = new Date();
            return 'mdl' + date.valueOf();
        }
        var init = function(options) {
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
            }
        }
    }();
})(jQuery);