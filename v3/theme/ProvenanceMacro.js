/*{{{*/
var provenanceMacro = config.macros.provenance = {
	/* Provenance macro checks the origin of the tiddler.
	   If it is inherited from another space, nothing is done.
	   If it was created in this space, or is a local modification
	   of a tiddler from another space, a label indicating this is
	   added.
	*/
  provenanceHelper: function(place,macroName,params,wikifier,paramString,tiddler) {
		var $ = jQuery;
		var currentSpace = config.extensions.tiddlyspace.currentSpace.name;
		var source = tiddler.fields['tiddler.source'];
		var labelText;
		var isLocal = config.filterHelpers.is.local(tiddler);
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
		$(place).attr("refresh", "macro").attr("macroName", macroName).html(labelText);  	
  },
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		/* Run provenanceHelper immediately, and then again after a delay
		   to ensure that server-side delays do not prevent the macro
		   from displaying the correct information for a newly cloned tiddler.
		*/
		provenanceMacro.provenanceHelper.apply(this, arguments);
		/*setTimeout(function(){
			provenanceMacro.provenanceHelper(place, tiddler);
		}, 2000);*/
	}
};
/*}}}*/