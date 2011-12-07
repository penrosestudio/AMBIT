/*{{{*/
config.extensions.ambitLoader = {
	dispatch: function() {
		// go get the content of app.js and eval them
		var text = store.getTiddlerText('app.js');
		eval(text);
	}
};

jQuery(document).bind("startup", config.extensions.ambitLoader.dispatch);
/*}}}*/