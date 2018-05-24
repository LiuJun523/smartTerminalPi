(function () {

    window.addEventListener('DOMContentLoaded', function () {
        var isStreaming = false;
        var start = document.getElementById('start');
        var video = document.getElementById('video');
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');

        start.addEventListener('click', function (e) {
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
        }, false);

        // Wait until the video stream can play
        video.addEventListener('canplay', function (e) {
            if (!isStreaming) {
                isStreaming = true;
            }
        }, false);

        // Wait for the video to start to play
        video.addEventListener('play', function () {
            // Every 33 milliseconds copy the video image to the canvas
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