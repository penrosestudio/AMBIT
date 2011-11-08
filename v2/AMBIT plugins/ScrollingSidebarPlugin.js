/*{{{*/
(function($) {

$(document).bind('startup', function() {
    var $sidebar   = $("#sidebar"),
        $window    = $(window),
        offset     = $sidebar.offset(),
        topPadding = parseInt($sidebar.css('paddingTop'),10),
        msPause	   = 300,
        IS_HOVERING = false,
        timeout;
    $window.scroll(function() {
		if(timeout) {
    		window.clearTimeout(timeout);
    	}
    	timeout = window.setTimeout(function() {
    		if(IS_HOVERING) {
    			return;
    		}
	        if ($window.scrollTop() > offset.top) {
	            $sidebar.stop().animate({
	                paddingTop: $window.scrollTop() - offset.top + topPadding
	            }, 'slow', 'linear');
	        } else {
	            $sidebar.stop().animate({
	                paddingTop: topPadding
		        }, 'swing', 'linear');
   	        }
    	}, msPause);
    });
    $sidebar.hover(function() {
    	IS_HOVERING = true;
    }, function() {
    	IS_HOVERING = false;
    });
});

}(jQuery));
/*}}}*/