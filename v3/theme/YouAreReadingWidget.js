/*{{{*/
(function($) {
	var $readingList,
		plugin;
	config.macros.youAreReading = {};
	plugin = config.macros.youAreReading;
	
	plugin.handler = function(place) {
		if(!$readingList) {
			$(document).bind("startup", this.dispatch);
		}
		$readingList = $('<ul class="browsingTool"></ul>').appendTo(place);
	};
	plugin.addItem = function(title, flashing) {
		var link = createTiddlyLink(null,title,true,(flashing ? "active" : "")),
			$newItem = $('<li></li>')
				.append('<span class="close">&times;</span>')
				.append(link);
		$newItem
			.appendTo($readingList)
			.find('span.close')
			.click(function() {
				story.closeTiddler(title, true);
			});
		if(flashing) {
			$newItem.css('backgroundColor', '#FFF')
				.fadeOut(75, function() {
					$newItem.fadeIn(75, function() {
						$newItem.css('backgroundColor', 'transparent');
					});	
				});
		}
	};
	plugin.refreshList = function(activeTitle, omit) {
		var title,
			active,
			id,
			idPrefix = "",
			prefixLength = idPrefix.length;
		$readingList.empty();
		$(story.getContainer())
			.find('.tiddler')
			.each(function(i, tid) {
				id = $(tid).attr("tiddler");
				title = id.substring(prefixLength);
				if(title && omit!==title) {
					active = activeTitle===title;
					plugin.addItem(title, active);
				}
			});
	};
	plugin.dispatch = function() {
		// populate list with default story
		plugin.refreshList();
			
		var tmpDisplayTiddler = Story.prototype.displayTiddler;
		Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,slowly) {
			var $element = $(srcElement);
			// disable scrolling for opening tiddlers from #tiddlerDisplay
			if($element.closest('#tiddlerDisplay').length) {
				/*var tmpStartAnimating = anim.startAnimating;
				anim.startAnimating = function() {
					anim.startAnimating = tmpStartAnimating;
				};*/
				var tmpAnimate = config.options.chkAnimate;
				var tmpScrollTo = window.scrollTo;
				window.scrollTo = function() {
					window.scrollTo = tmpScrollTo;
					config.options.chkAnimate = tmpAnimate;
				};
				config.options.chkAnimate = false;
				var tmpPositionTiddler = Story.prototype.positionTiddler;
				Story.prototype.positionTiddler = function() {
					Story.prototype.positionTiddler = tmpPositionTiddler;
					return null; // open at bottom
				};
				// animate the title over to the you are reading list
				var linkText = $element.is('a') ? $element.text() : (tiddler instanceof Tiddler ? tiddler.title : tiddler),
					$linkClone = $("<span>"+linkText+"</span>").appendTo($('#displayArea')),
					y = $element.offset().top,
					mainPaneOffset = $('#displayArea').offset(),
					x = $element.offset().left-mainPaneOffset.left,
					$readingList = $('#currentlyOpenPanel li'),
					$target = $readingList.eq($readingList.length-1),
					toY = $target.offset().top + $target.height() + parseInt($target.css('paddingTop'),10) + parseInt($target.css('paddingBottom'),10) + parseInt($target.css('marginTop'),10) + parseInt($target.css('marginBottom'),10),
					toX = $target.offset().left;
				$linkClone.css({
					"position": "absolute",
					"z-index": "10",
					"top": y+'px',
					"left": x+'px',
					"lineHeight": "1em",
					"color": "#000000",
					"opacity": 0.7
				}).animate({
					'opacity': 0.5,
					'top': toY+'px',
					'left': toX-mainPaneOffset.left+'px'
				},
				1000,
				function() {
					$(this).remove();
				});
			}
			// recreate list when tiddler opened - JRL: this looks wrong, as title is used before it is defined...
			var t = story.chooseTemplateForTiddler(title, template);
			tmpDisplayTiddler.apply(this, [srcElement, tiddler, template, animate, slowly]);

			if(t.indexOf('ViewTemplate')!==-1) {
				var title = (tiddler instanceof Tiddler) ? tiddler.title : tiddler;
				plugin.refreshList(title);
			}
		};
		
		// recreate list when tiddler closed
		var tmpCloseTiddler = Story.prototype.closeTiddler;
		Story.prototype.closeTiddler = function(title, animate, unused) {
			tmpCloseTiddler.apply(this, arguments);
			plugin.refreshList(title, title);
		}
	};
}(jQuery));
/*}}}*/