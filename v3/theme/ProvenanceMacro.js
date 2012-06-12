/*{{{*/
config.macros.provenance = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var $ = jQuery;
		var currentSpace = config.extensions.tiddlyspace.currentSpace.name;
		var bag = tiddler.fields['server.bag'];
		var tiddlerSpace = bag.substring(0,bag.lastIndexOf('_'));		
		var isLocal = config.filterHelpers.is.local(tiddler);
		var source = tiddler.fields['tiddler.source'];
		var labelText;

		if (isLocal) {
			if (source) {
				labelText = "Derived from <a href='http://" + source + ".tiddlyspace.com/#[[" + encodeURIComponent(tiddler.title) + "]]' target='_blank'>" + source + "</a>";
			} else {
				labelText = currentSpace + " original content.";
			}
		} else {
			// Page is inherited. Return without adding label. 
			return;
		}

		$(place).html(labelText);
	}
};
/*}}}*/