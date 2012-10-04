/*{{{*/
var provenanceMacro = config.macros.provenance = {
	/* Provenance macro checks the origin of the tiddler.
	   If it is inherited from another space, nothing is done.
	   If it was created in this space, or is a local modification
	   of a tiddler from another space, a label indicating this is
	   added.
	*/
	provenanceHelper: function(place) {
		var $ = jQuery,
			$place = $(place),
			title = $place.data("tiddler"),
			tiddler = store.getTiddler(title),
			currentSpace = config.extensions.tiddlyspace.currentSpace.name,
			source,
			labelText,
			isLocal;
		if(!tiddler) { // it is possible that provenanceHelper is called before the handler has setup the tiddler
			return;
		}
		source = tiddler.fields['tiddler.source'];
		isLocal = config.filterHelpers.is.local(tiddler);
		if (isLocal) {
			if (source) {
				labelText = "Derived from <a href='http://" + source + ".tiddlyspace.com/#[[" + encodeURIComponent(tiddler.title) + "]]' target='_blank'>" + source + "</a>";
			} else {
				labelText = currentSpace + " original content";
			}
		} else {
			// Page is inherited. Return without adding label.
			return;
		}
		$place.html(labelText);	
	},
	refresh: function(place) {
		provenanceMacro.provenanceHelper(place);
	},
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		$(place).attr("refresh", "macro")
			.attr("macroName", macroName)
			.data("tiddler", tiddler.title);
		provenanceMacro.provenanceHelper(place);
	}
};
/*}}}*/