//{{{
jQuery(document).bind("startup", function() {
	var _tmpCloneTiddlerHandler = config.commands.cloneTiddler.handler;
	config.commands.cloneTiddler.handler = function(ev, src, title) {
		_tmpCloneTiddlerHandler.apply(this, arguments);
		var tiddler = store.getTiddler(title);
		if(tiddler) {
			tiddler.fields["server.workspace"] = config.extensions.tiddlyspace.getCurrentWorkspace("public"); // the default is private
		}
	};
});
//}}}