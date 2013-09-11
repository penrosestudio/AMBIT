/*{{{*/

/*
	What we're doing
		- go find all content that is cloned from this space (on init)
		- when running the macro, try to find this tiddler in the content
			- if found, show count of tiddlers
		- when you click on the count, open up a popup with the information:
			- title of tiddler / space / date cloned

	BUG: if the tiddler loads visible (e.g. by visiting that previous link), this doesn't work. See Provenance macro for help I think! The view needs to be refreshed
	
	On cloning, what I want to be able to support is this flow:
		- I clone a tiddler and save it in my space
		- when I visit the space I cloned the tiddler from, the tiddler I cloned tells me that clones of it exist, and points to which spaces they are in and when they were cloned
		- I want this connection to remain EVEN IF I change the title of the tiddler in my space
		(nice to have: - I want this connection to remain EVEN IF the title of the tiddler I cloned changes)

	pieces:
		- <bag>/<title> _source field e.g. _source: /bags/totw_public/tiddlers/Why
		- preserving original title in a field when renaming (?) You could presumably alter the rename routines to keep a
history of previous names
			- don't do this for now
		- TwinTiddlers (?)

*/

var voteOfConfidenceMacro = config.macros.voteOfConfidence = {
	/* Vote of Confidence macro checks how many times a tiddler has been cloned and display some information about those clones. */
	clonedTiddlers: {},
	queue: [],
	init: function() {
		var plugin = config.macros.voteOfConfidence,
			$ = jQuery,
			currentSpace = config.extensions.tiddlyspace.currentSpace.name,
			url = "/search.json?q=tiddler.source:"+currentSpace+"_public";
		url = "/search.json?q=tiddler.source:"+currentSpace+"_public"; // this is for debug
		$.ajax({
			url: url,
			dataType: "json",
			success: function(tiddlers) {
				plugin.initDone = true;
				// make sure we are not including any non-ambit tiddlers
				tiddlers = $.grep(tiddlers, function(t, i) {
					return t.bag.indexOf('ambit')!==-1;
				});
				// index all the cloned tiddlers by _source
				$.each(tiddlers, function(i, tiddler) {
					var _source = tiddler.fields['tiddler._source'];
					if(!_source) {
						return true;
					}
					if(!plugin.clonedTiddlers[_source]) {
						plugin.clonedTiddlers[_source] = [];
					}
					plugin.clonedTiddlers[_source].push(tiddler);
				});
				// trigger any waiting macro calls
				$.each(plugin.queue, function() {
					this();
				});
			},
			error: function() {
				// TO-DO: decide what to do in the event of an error
			}
		});
	},
	getSourceFromTitle: function(title,space) {
		var currentSpace = config.extensions.tiddlyspace.currentSpace.name;
		return '/bags/'+(currentSpace||space)+'_public/tiddlers/'+encodeURIComponent(title);
	},
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		console.log('handler');
		var plugin = config.macros.voteOfConfidence,
			displayCloneCount = function() {
				var plugin = config.macros.voteOfConfidence,
					$ = jQuery,
					$place = $(place),
					title = tiddler.title,
					_source = plugin.getSourceFromTitle(title),
					clones = plugin.clonedTiddlers[_source],
					clonedCount = clones && clones.length;
				if(!clonedCount) {
					return;
				}
				$place.html('<a href="#">cloned '+clonedCount+' times</a>')
					.children('a')
					.click(function(e) {
						e.preventDefault();
						var popup = Popup.create(this,null,"voteOfConfidence popup"),
							$popup = $(popup),
							htmlPieces = ["<div>"];
						$.each(clones, function(i, t) {
							var space = t.bag.replace('_public',''),
								created = Date.convertFromYYYYMMDDHHMM(t.created).formatString('0DD/0MM/YY');
							htmlPieces.push("<div class='grid2col left marginright'><a href='http://"+space+".tiddlyspace.com/#[["+t.title+"]]' target='_blank'>"+t.title+"</a></div><div class='grid2col left marginright'>"+space+"</div><div class='grid2col left'>"+created+"</div><br class='clearboth' />");
						});
						htmlPieces.push("</div>");
						html = htmlPieces.join("\n");
						$(html).appendTo($popup);
						Popup.show();
						return false;
					});
			};
		if(!plugin.initDone) {
			// place this call into a queue
			plugin.queue.push(displayCloneCount);
		} else {
			// perform this call now
			displayCloneCount();
		}
	}
};

/* addition to cloneTiddler so that it saves the cloned tiddler title as _source field */
/*var _cloneHandler = config.commands.cloneTiddler.handler;
config.commands.cloneTiddler.handler = function(event, src, title) {
	var _tiddler = store.getTiddler(title);
	var source = _tiddler ? _tiddler.fields["server.bag"] : false;
	var _source = _tiddler ? '/bags/'+source+'/tiddlers/'+encodeURIComponent(_tiddler.title) : false;
	var realTitle = _tiddler ? _tiddler.fields["server.title"] : title;
	_cloneHandler.apply(this, [event, src, title]);
	var tidEl = story.getTiddler(title);
	$(story.getTiddlerField(title, "title")).val(realTitle);
	if(_source) {
		$("<input />").attr("type", "hidden").attr("edit", "tiddler._source").val(_source).appendTo(tidEl);
	}
};*/

/*}}}*/