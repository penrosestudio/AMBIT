/*{{{*/
(function() {
	var $ = jQuery,
		$historyBox,
		$historyList,
		scrollingInterval;

	config.macros.history = {
		init: function() {
			// add behaviour to tiddler opening
		},
		handler: function(place) {
			if(!$historyBox) {
				/* TW macro handlers get called twice (bug), but the first time, place is not set to the correct element - it is some mysterious element which ends up not in the document. So we have to let the HTML creation happen twice, but not the event binding */
				$(document).bind("startup", this.dispatch);
			}
			$historyBox = $('<div class="historyBox"></div>')
				.append('<div class="scrollBar"></div>')
				.appendTo(place);
			$historyList = $('<ul class="browsingTool"></ul>')
				.appendTo($historyBox)
				.css({
					position: 'relative',
					top: 0
				}); // prepare for scrolling
			/*$historyBox.find('.scrollBar span').mousedown(function(e) {
				var direction = e.target.className === "up" ? 1 : -1;
				scrollingInterval = window.setInterval(function() {
					var top = parseInt($historyList.css('top'),10),
						newTop = top;
					if(direction > 0 && top < 0) {
						newTop = top + 3;
					} else if(direction < 0 && $historyList.height()+top > $historyBox.height()) {
						newTop = top - 3;
					}
					$historyList.css({
						top: newTop+"px"
					});
				}, 100);
			}).mouseup(function(e) {
				window.clearInterval(scrollingInterval);
			}).mouseout(function(e) {
				window.clearInterval(scrollingInterval);
			});*/
		},
		listItem: function(title, active, addToBottom) {
			var mostRecentTiddler = $historyList.find('li').eq(0).text();
			if(title!==mostRecentTiddler) {
				var link = createTiddlyLink(null,title,true,(active ? "active" : "")),
					$newItem = $('<li></li>').append(link);
				if(addToBottom) {
					$historyList.append($newItem);
				} else {
					$historyList.prepend($newItem);
				}
			}
		},
		dispatch: function() {
			// populate history from story
			var title,
				id,
				idPrefix = "",
				prefixLength = idPrefix.length,
				plugin = config.macros.history;
			$(story.getContainer())
				.find('.tiddler')
				.each(function(i, tid) {
					title = $(tid).attr("tiddler");
					plugin.listItem(title, i===0, 'bottom');
				});
			
			// add to history whenever tiddler is opened
			var tmpDisplayTiddler = Story.prototype.displayTiddler;
			Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,slowly) {
				var t = story.chooseTemplateForTiddler(title, template);
				if(t.indexOf('ViewTemplate')!==-1) {
					var title = (tiddler instanceof Tiddler) ? tiddler.title : tiddler;
					plugin.listItem(title);
				}
				tmpDisplayTiddler.apply(this, arguments);
			};
		}
	};
}());

/*}}}*/