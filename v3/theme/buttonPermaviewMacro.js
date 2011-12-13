/*{{{*/

function createTiddlyButtonButton(parent,text,tooltip,action,className,id,accessKey,attribs) {
		
		var btn = document.createElement("button");
		btn.setAttribute("type", "button");
		if(tooltip)
			btn.setAttribute("title",tooltip);
		if(text)
			btn.appendChild(document.createTextNode(text));
		btn.className = className || "";
		if(id)
			btn.id = id;
		if(attribs) {
			for(var i in attribs) {
				btn.setAttribute(i,attribs[i]);
			}
		}
		if(parent)
			parent.appendChild(btn);
		if(action) {
			jQuery(btn).click(action);
		}
		if(accessKey)
			btn.setAttribute("accessKey",accessKey);
		return btn;
}

config.macros.buttonPermaviewMacro = {
	handler: function(place, macroName, params) {
		var tooltip = "Click this button to generate a link in the address bar that will open exactly what is open in your manual right now";
		createTiddlyButtonButton(place, this.label, tooltip, this.onClick, 'jsIgnore', 'snapshot');
	},
	label: "snapshot",
	onClick: config.macros.permaview.onClick
};

/*}}}*/