/*
	Title: NoRefreshSlider
	Description: allows you to create sliders that don't refresh their content when a general refresh is called. This can be useful when you have dynamic content in the revealed slider e.g. with AJAX requests you don't want to refire; or a table you don't want to rebuild
	Version: v0.1
	
	Usage: <<slider chkOption [[tiddler to show]] buttonLabel buttonHover [noRefresh]>>
	i.e. same as regular slider with optional 'noRefresh' parameter
	if noRefresh is present, slider will not refresh content when a general refresh is called

	Changelog:
		v0.1: June 20th, 2013
*/
/*{{{*/
config.macros.slider.handler = function(place,macroName,params) {
	var panel = this.createSlider(place,params[0],params[2],params[3]);
	var text = store.getTiddlerText(params[1]);
	var noRefresh = params[4];
	if(!noRefresh) {
		panel.setAttribute("refresh","content");
	}
	panel.setAttribute("tiddler",params[1]);
	if(text)
		wikify(text,panel,null,store.getTiddler(params[1]));
};
/*}}}*/