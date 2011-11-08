//{{{
config.macros.ambitSetup = {
	settings: {
		tidTitle: "AmbitSetup",
		tidText: "Please do not edit this tiddler. It was created during setup."
	},
	dispatch: function() {
		if(config.extensions.tiddlyspace.currentSpace.type !== "private") {
			return;
		}
		var plugin = config.macros.ambitSetup,
			tidTitle = plugin.settings.tidTitle,
			tidText = plugin.settings.tidText;
		if(!store.getTiddler(tidTitle)) {
			story.closeAllTiddlers();
			story.displayTiddler(null,"GettingStarted");
		}
	}
};

config.macros.completeSetup = {
	onChange: function(tiddler) {
		var settings = config.macros.ambitSetup.settings,
			tidTitle = settings.tidTitle,
			tidText = settings.tidText,
			tid = store.saveTiddler(tidTitle,tidTitle,tidText,null,null,null,config.defaultCustomFields);
		autoSaveChanges(null, [tid]);
		story.closeTiddler(tiddler.title);
		story.displayDefaultTiddlers();
	},
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		createTiddlyButton(place, "complete setup", "click to complete setup", function() {
			config.macros.completeSetup.onChange(tiddler);
		});
	}
};

jQuery(document).bind("startup", config.macros.ambitSetup.dispatch);
//}}}