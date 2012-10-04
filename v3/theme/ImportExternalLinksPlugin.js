/***
|''Name''|ImportExternalLinksPlugin|
|''Author''|Jon Robson|
|''Version''|0.3.0|
|''Requires''|TiddlySpaceConfig TiddlySpaceLinkPlugin TiddlySpaceCloneCommand|
|''Description''|Turns space links into ajax links so you don't have to leave the comfort of your own TiddlyWiki|
!Notes
This maybe should hides the editTiddler, cloneTiddler commands. Ideally the toolbar commands should hide themselves but we need a strong concept of "this is a sucked in tiddler" to do that.
***/
//{{{
(function($){
var tiddlyspace = config.extensions.tiddlyspace;
_createSpaceLink = createSpaceLink;
if(_createSpaceLink) {
	createSpaceLink = function(place, spaceName, title, alt, isBag) {
		var tooltip = "Click to open in current document. Right click to open in original space.";
		_createSpaceLink(place, spaceName, title, alt, isBag);
		var workspace;
		if(isBag) {
			workspace = "bags/%0".format(spaceName);
		} else {
			workspace = "bags/%0_public".format(spaceName);
		}
		if(title && spaceName != tiddlyspace.currentSpace.name) {
			var link = $("a:last", place);
			var newlink = $("<a />").text("[link]").after(link[0]);
			// very hacky
			var updateInterval = setInterval(function() {
				var href = link.attr("href");
				if(href) {
					$(newlink).attr("href", href);
					clearInterval(updateInterval);
				}
			}, 200);
			
			if(link.parent(".replyLink").length == 0) { // don't suck in a reply link.
				link.attr("title", tooltip).addClass("importLink").click(function(ev) {
					if(config.floorboards) {
						config.floorboards.pushUnique("%0_public".format(spaceName));
					}
					tiddlyspace.displayServerTiddler(ev.target, title, workspace, function(el) {
						// TODO: the commands should disable themselves based on the meta information.
						//$("[commandname=editTiddler], [commandname=cloneTiddler]", el).hide(); 
					});
					ev.preventDefault();
				});
			}
		}
	};
}

var _cloneHandler = config.commands.cloneTiddler.handler;
config.commands.cloneTiddler.handler = function(event, src, title) {
	var _tiddler = store.getTiddler(title);
	var source = _tiddler ? _tiddler.fields["server.bag"] : false;
	var imported = _tiddler ? _tiddler.fields["tiddler.source"] : false;
	var realTitle = _tiddler ? _tiddler.fields["server.title"] : title;
	_cloneHandler.apply(this, [event, src, title]);
	var tidEl = story.getTiddler(title);
	$(story.getTiddlerField(title, "title")).val(realTitle);
	if(source) {
		$("<input />").attr("type", "hidden").attr("edit", "tiddler.source").val(source).appendTo(tidEl);
		$("<input />").attr("type", "hidden").attr("edit", "server.activity").appendTo(tidEl);
	}
}
})(jQuery);
//}}}