/*{{{*/
(function($) {
	var $tiddlerDisplay,
		origPos,
		origZIndex;
	$(document).bind("startup", function() {
		$tiddlerDisplay = $('#tiddlerDisplay');
		origPos = $tiddlerDisplay.css('position');
		origZIndex = $tiddlerDisplay.css('zIndex');
		$tiddlerDisplay.hover(function() {
			$tiddlerDisplay.css({
				'position': 'relative',
				'zIndex': 1
			});
		}, function() {
			$tiddlerDisplay.css({
				'position': origPos,
				'zIndex': origZIndex
			});
		});
	});

}(jQuery));
/*}}}*/