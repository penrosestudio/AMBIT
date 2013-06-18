/*{{{*/
config.macros.communityOfPractice = {
	/* 
		1.
		- get the data (changes across all manuals)
		- get top 10 by date
		- spit it out as a table
		2.
		- add hover popup
		- add text
		- add link to original
	*/
	searchURL: '/search.json?q=title:"%0"',
	feedPath: '/bags/%0_public/tiddlers.json?fat=1',
	tiddlers: [],
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var plugin = config.macros.communityOfPractice,
			feedPath = plugin.feedPath,
			$ = jQuery,
			whitelist = store.getTiddler('Trained/Training AMBIT services manualizing their work').text.split('\n'),
			ajaxCount = 0,
			ajaxLimit = whitelist.length;
		$.each(whitelist, function(i, line) {
			var pieces = line.split(':'),
				space = pieces[0],
				urlStem = pieces[1],
				url = urlStem+feedPath.format(encodeURIComponent(space));
			$.ajax({
				url: url,
				dataType: "json",
				success: function(tiddlers) {
					tiddlers = $.grep(tiddlers, function(t, i) {
						// ensure tiddlers are from the space we queried
						// NB: shouldn't need this when querying tiddler feed
						//return t.bag.indexOf('ambit')!==-1 && t.bag!==tiddler.fields['server.bag'];
						return true;
					});
					plugin.allTiddlers = plugin.allTiddlers.concat(tiddlers);
					ajaxCount++;
					if(ajaxCount===ajaxLimit) {
						plugin.processResults(place);
					}
				},
				error: function() {
					$(place).prepend('(error)');
				}
			});
		});
	},
	processResults: function(place) {
		// create results table
		var $ = jQuery,
			$table = $("<table><thead><tr><th>Page name</th><th>Manual</th><th>Editor</th><th>Date</th></tr></thead><tbody></tbody></table>").appendTo(place),
			$tbody = $table.find('tbody');
		// process tiddlers into table
		$.each(config.macros.communityOfPractice.tiddlers, function(i, tiddler) {
			var name = tiddler.title,
				bag = tiddler.fields['server.bag'], // TO-DO: maybe add space to the tiddler fields for convenience in AJAX success
				editor = tiddler.modifier,
				modified = new Date(tiddler.modified);
			$tbody.append("<tr><td>"+name+"</td><td>"+bag+"</td><td>"+editor+"</td><td>"+modified+"</td></tr>");
		});
	}
/*	NOT necessary in this macro?
	wrapWithElsewhereLink: function(place, tiddlers, tiddler) {
		var $ = jQuery;
		var $place = $(place)
			.wrap("<a></a>")
			.parent().click(function() {
				var popup = Popup.create(this),
					$ul,
					bag,
					space,
					diffURL = "diff?rev1=bags/"+tiddler.fields['server.bag']+"/"+encodeURIComponent(tiddler.title)+"/"+tiddler.fields['server.page.revision']+"&rev2=bags/<bag>/"+encodeURIComponent(tiddler.title)+"/<revision>&format=horizontal";
				if(popup) {
					$popup = $(popup);
					$.each(tiddlers, function(i, t) {
						bag = t.bag;
						space = bag.substring(0, bag.lastIndexOf('_'));
						$popup.append('<li><a href="'+diffURL.replace("<bag>",bag).replace("<revision>",t.revision)+'" target="_blank">'+space+'</li>');
					});
				}
				Popup.show();
				return false;
			});
	}*/
};

/* maybe repurpose to go-to button */
// newHere plugin - http://mptw.tiddlyspot.com/#NewHerePlugin
/*config.macros.newHere = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		$(place).attr({
			refresh: 'macro',
			macroName: 'newHere'
		}).data('args', arguments);
		wikify("<<newTiddler "+paramString+" tag:[["+tiddler.title+"]]>>",place,null,tiddler);
	},
	refresh: function(place, params) {
		var args = $(place).empty().data('args');
		this.handler.apply(this, args);
	}
};*/

/*}}}*/