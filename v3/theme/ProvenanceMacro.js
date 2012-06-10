/*{{{*/
config.macros.provenance = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var $ = jQuery;
		var popUpText;
		var currentSpace = config.extensions.tiddlyspace.currentSpace.name;
		
		var bag = tiddler.fields['server.bag'];
		var tiddlerSpace = bag.substring(0,bag.lastIndexOf('_'));		
		
		var isLocal = config.filterHelpers.is.local(tiddler);

		var source = tiddler.fields['tiddler.source'];

		if (isLocal) {
			if (source) {
				popUpText = "This page is an overwrite of <a href='http://" + source + ".tiddlyspace.com/#[[" + encodeURIComponent(tiddler.title) + "]]' target='_blank'>" + source + "/" + tiddler.title + "</a>";
			} else {
				popUpText = "This is a local " + currentSpace + " page.";
			}
		} else {
			popUpText = "This page is inherited from <a href='http://" + tiddlerSpace + ".tiddlyspace.com/#[[" + encodeURIComponent(tiddler.title) + "]]' target='_blank'>" + tiddlerSpace + "</a>";
		}

		$(place).html(tiddlerSpace);
		
		$(place).click(function() {
			var popup = Popup.create(this);
			$(popup).append(popUpText);
			Popup.show();
			return false;
		});
	}
};
/*}}}*/