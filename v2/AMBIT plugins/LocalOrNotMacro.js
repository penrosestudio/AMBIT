/*{{{*/
config.macros.localOrNot = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var $ = jQuery,
			coreBag = "ambit-content_public",
			encodedTitle = encodeURIComponent(tiddler.title),
			bag = tiddler.fields['server.bag'],
			diffURL;
		if(config.filterHelpers.is.local(tiddler)) {
			// it's local, so check core manual
			$.get("/bags/"+coreBag+"/tiddlers/"+encodedTitle+".json", function(t) {
				if(t && t.fields) {
					// there's a version on the core, make local click open the side-by-side view
					diffURL = "diff?rev2=bags/"+bag+"/"+encodedTitle+"/"+tiddler.fields['server.page.revision']+"&rev1=bags/"+encodeURIComponent(t.bag)+"/"+encodedTitle+"/"+t.revision+"&format=horizontal";
					
					place.innerHTML = '<a href="'+diffURL+'" target="_blank" title="Click to see comparison with core manual">local</a>';
				}
			});
			// alter the background-colour of the closest .headingPanel
			$(place)
				.closest('.headingPanel')
				.addClass('local');
		}
	}
};
/*config.macros.localOrNot = {
	// NB: hard-coding comparison to ambit-content space
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var coreBag = "ambit-content_public",
			bag = tiddler.fields['server.bag'],
			host = tiddler.fields['server.host'],
			bagStem = bag.substring(0,bag.lastIndexOf('_')),
			hostStem = host.substring(host.indexOf('http://')+7,host.indexOf('.')),
			diffURL,
			encodedTitle = encodeURIComponent(tiddler.title),
			$ = jQuery;
		if(bagStem===hostStem) {
			// it's local, so check core manual

			$.get("/bags/"+coreBag+"/tiddlers/"+encodedTitle+".json", function(t) {
				if(t && t.fields) {
					// there's a version on the core, make local click open the side-by-side view
					diffURL = "diff?rev2=bags/"+bag+"/"+encodedTitle+"/"+tiddler.fields['server.page.revision']+"&rev1=bags/"+encodeURIComponent(t.bag)+"/"+encodedTitle+"/"+t.revision+"&format=horizontal";
					
					place.innerHTML = '<a href="'+diffURL+'" target="_blank" title="Click to see comparison with core manual">local</a>';
				
					// alter the background-colour of the closest .headingPanel
					jQuery(place)
						.closest('.headingPanel')
						.css('backgroundColor', '#FCEBFF');				
				}
			});
		}
	}
};*/
/*}}}*/