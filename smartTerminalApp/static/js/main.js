$(function() {
    $("#btn_start").click(function() {
        var t = 0;
        var interval = $("#interval").val();
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

                if(new Date().getTime() - startTime >= 10 * 1000) {
                    clearInterval(intervalFuc);
                    return;
                }
            }, interval * 1000);

	});
});