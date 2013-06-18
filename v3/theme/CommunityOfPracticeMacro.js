/*{{{*/
config.macros.communityOfPractice = {
	/* 
		1. DONE
		- get the data (changes across all manuals)
		- get top 10 by date
		- spit it out as a table
		2.
		- make page title a link
		- add hover popup
		- add text
		- add link to original
	*/
	searchURL: '/search.json?fat=1&q=',
	feedPath: '/bags/%0_public/tiddlers.json?fat=1',
	tiddlers: [],
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var plugin = config.macros.communityOfPractice,
			$ = jQuery,
			$place = $('<div>loading Community of Practice data...</div>').appendTo(place),
			feedPath = plugin.feedPath,
			whitelist = store.getTiddler('Trained/Training AMBIT services manualizing their work').text.split('\n'),
			bagFilters = [],
			url;
		plugin.place = $place;
		$.each(whitelist, function(i, line) {
			var pieces = line.split(':'),
				space = pieces[0];
			if(space) {
				bagFilters.push("bag:"+space+"_public");
			}
		});
		url = plugin.searchURL + "("+bagFilters.join(" OR ")+")";
		$.ajax({
			url: url,
			dataType: "json",
			success: function(tiddlers) {
				// make sure we are not including tiddlers from this space (and any non-ambit tiddlers, which shouldn't be the case anyway)
				tiddlers = $.grep(tiddlers, function(t, i) {
					return t.bag.indexOf('ambit')!==-1 && t.bag!==tiddler.fields['server.bag'];
				});
				plugin.tiddlers = tiddlers;
				plugin.processResults();
			},
			error: function() {
				$place.prepend('(error)');
			}
		});
	},
	processResults: function() {
		// create results table
		var $ = jQuery,
			plugin = config.macros.communityOfPractice,
			place = plugin.place.empty(),
			$table = $("<table><thead><tr><th>Page name</th><th>Manual</th><th>Editor</th><th>Date</th></tr></thead><tbody></tbody></table>").appendTo(place),
			$tbody = $table.find('tbody');
		// process tiddlers into table
		$.each(config.macros.communityOfPractice.tiddlers, function(i, tiddler) {
			var name = tiddler.title,
				text = tiddler.text,
				bag = tiddler.bag,
				space = bag.split('_')[0],
				editor = tiddler.modifier,
				modified = Date.convertFromYYYYMMDDHHMM(tiddler.modified).formatString("0DD/0MM/YY"),
				$row = $("<tr><td><a href='#'>"+name+"</a></td><td>"+space+"</td><td>"+editor+"</td><td>"+modified+"</td></tr>").appendTo($tbody);
			$row.find('a').click(function(e) {
				e.preventDefault();
				var popup = Popup.create(this),
					$popup = $(popup);
				console.log(tiddler);
				$popup.append("<strong>Page: "+name+"</strong><br>Manual: "+space+"<br><a href='"+tiddler.permalink+"' class='button'>Go to</a><br><br>");
				wikify(plugin.diffExtract(name, text), popup);
				Popup.show();
				return false; // without this the popup doesn't appear. I don't know why, but it ends up not attached to any element
			});
		});
	},
	diffExtract: function(name, text) {
		// return a snippet of text with the difference highlighted
		// for now, just return 200 characters of text
		return text.length>200 ? text.substr(0, 197)+"<html>&hellip;</html>" : text;
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