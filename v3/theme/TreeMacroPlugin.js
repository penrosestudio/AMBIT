/*{{{*/
(function() {
	var $ = jQuery,
		plugin;
		config.macros.tree = {};
	plugin = config.macros.tree;
	plugin.handler = function(place,macroName,params) {
		var tags = params[0],
			$contentsList;
		if(!tags) {
			return;
		}
		tags = params[0].readBracketedList();
		$contentsList = $('<ul></ul>')
			.appendTo(place);
		$.each(tags, function(i, tag) {
			plugin.addListItems(tag, $contentsList);
		});
	};
	plugin.addListItems = function(tag, $parentList, recursionLevel) {
		if(!recursionLevel) {
			recursionLevel = 0;
		}
		var tiddlers,
			moreTids,
			link,
			$listItem,
			$subList;

		link = createTiddlyLink(null,tag,false);
		$listItem = $('<li></li>').appendTo($parentList);
		$(link)
			.append(tag)
			.appendTo($listItem);
			
		if(recursionLevel<2) {
			tiddlers = store.getTaggedTiddlers(tag);
			moreTids = tiddlers.length;
			if(moreTids) {
				$listItem.prepend('<span class="closed"></span>');
				$subList = $('<ul class="browsingTool"></ul>')
					.css('display','none')
					.appendTo($listItem);
			
				$listItem.click(function(e) {
					$(this)
						.children('span')
						.toggleClass('closed open')
						.end()
						.children('ul')
						.slideToggle();
					return false;
				});
				
				$.each(tiddlers, function(i, tid) {
					plugin.addListItems(tid.title, $subList, recursionLevel+1);
				});
			}
		}
		if(!moreTids) {
			$listItem.click(function(e) {
				return false;
			});
		}
	};
}());
/*}}}*/

/* structure we're aiming for:
	<ul>
		<li>
			<span class="open"></span><a>Introduction</a>
			<ul>
				<li><a>Overview of AMBIT</a></li>
				<li><a>Core Features of Ambit</a></li>
				<li><a>Feedback Please!</a></li>
				<li><a>Find your way around</a></li>
				<li><a>Security and authorisation</a></li>
				<li><a>Start here: Mark the task</a></li>
				<li><a>Using the Manual</a></li>
				<li><a>Videos</a></li>
			</ul>
		</li>
		<li><span class="closed"></span><a>What is our team?</a>
			<ul>
				<li><a>Sample link</a></li>
			</ul>
		</li>
	</ul>
*/