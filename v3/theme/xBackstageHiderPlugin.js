/*{{{*/
// this needs to be called after TiddlySpaceInit, otherwise the click handler ends up not working, so the file has 'x' appended to it
// disabled 12/12/11 and brought into app.js
config.options.chkBackstage = false;
jQuery(document).bind("startup", function() {
	//jQuery('#backstageButton').empty();
	jQuery('#statusPanel a.advanced').live("click", function(e) {
		e.preventDefault();
		backstage.isVisible() ? backstage.hide() : backstage.show();
		return true;
	});
});
/*}}}*/