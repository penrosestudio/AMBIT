/*{{{*/
config.macros.AMBITFormatterChanges = {

	init: function() {
		for(var i=0;i<formatter.formatters.length;i++)
		{
			if(formatter.formatters[i].name=="heading") //(say)
			{
				formatter.formatters[i].handler = function(w) {
					var headingCount = w.matchLength + 2;
					if(headingCount > 6) {
						headingCount = 6;
					}
					w.subWikifyTerm(createTiddlyElement(w.output,"h" + headingCount),this.termRegExp);
				};
			} else if(formatter.formatters[i].name=="table") {
				formatter.formatters[i]._handler = formatter.formatters[i].handler;
				formatter.formatters[i].handler = function(w) {
					var _output = w.output;
					w.output = createTiddlyElement(w.output, "div", null, "tableContainer");
					this._handler.apply(this,arguments);
					w.output = _output;
				};
			}
		}
	}
};
/*}}}*/