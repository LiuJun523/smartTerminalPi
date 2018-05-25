(function () {
    window.addEventListener('DOMContentLoaded', function () {
        var isStreaming = true;
        var start = document.getElementById('btn_start');
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
                saveImageAs(canvas, "snap.jpg", "jpeg");
            }, 33);
        }, false);

        function saveImageAs(canvas, filename, type, quality){
            var anchorElement, event, blob;
            type = type ? "png" : type;

            // for IE >= 10
            if(canvas.msToBlob !== undefined && navigator.msSaveBlob !== undefined){
               blob = canvas.msToBlob();
               navigator.msSaveBlob(blob, filename + "." + type);
               return;
            }
            anchorElement = document.createElement('a');    // Create a download link
            if(type.toLowerCase() === "jpg" || type.toLowerCase() === "jpeg"){
                quality = quality ? quality : 0.9;
                anchorElement.href = canvas.toDataURL("image/jpeg",quality);         // attach the image data URL
            }else{
                anchorElement.href = canvas.toDataURL();         // attach the image data URL
            }
            // check for download attribute
            if ( anchorElement.download !== undefined ) {
                anchorElement.download = filename + "." + type; // set the download filename
                if (typeof MouseEvent === "function") {     // does the browser support the object MouseEvent
                    event = new MouseEvent( "click", {view  : window, bubbles: true,cancelable : true} );
                    anchorElement.dispatchEvent(event); // simulate a click on the download link.
                } else
                if (anchorElement.fireEvent) {          // if no MouseEvent object try fireEvent
                    anchorElement.fireEvent("onclick");
                }
            }
        }
    });
})();

$(function() {
    $("#btn_start").click(function() {
        var t = 0;
        var interval = $("#interval").val();
        var time = parseInt($("#remainSeconds").html()) * 60;
        var startTime = new Date().getTime();
        // Changing image according interval time
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

                if(new Date().getTime() - startTime >= time * 1000) {
                    clearInterval(intervalFuc);
                    return;
                }
            }, interval * 1000);
	});
});

$(document).ready(function () {
    $("#btn_start").click(function() {
        SysSecond = parseInt($("#remainSeconds").html()) * 60;
        if (SysSecond != "" && !isNaN(SysSecond)) {
            InterValObj = window.setInterval(SetRemainTime, 1000);
        }
    });
});

function SetRemainTime() {
    if (SysSecond > 0) {
        SysSecond = SysSecond - 1;
        var second = padLeft(Math.floor(SysSecond % 60), 2);
        var minite = padLeft(Math.floor((SysSecond / 60) % 60), 2);

        $("#remainTime").html('<h2 class="text-left text-danger">Testing Time: ' + minite + ':' + second + '</h2>');
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