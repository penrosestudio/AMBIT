/*{{{*/
var $ = jQuery;

config.macros.searchBox = {
	handler: function(place, macroName, params) {
		// add choice for searching all manuals	
		$(place).append('<div class="allManuals"> \
			<label for="allManuals">Search all manuals</label> \
			<input type="checkbox" id="allManuals" /> \
		</div>');
	
		var $input = $('<input type="search" results="5" accessKey="4" autocomplete="off" autosave="unique" name="s" placeholder="Search" lastSearchText="" />').appendTo(place),
			$clearButton = $('<button id="clearSearch">&#215;</button>'),
			input = $input.get(0);
		if(config.browser.isSafari) {
			$input.css({
				height: '28px',
				width: '230px',
				'background-image': 'none',
				'-webkit-appearance': 'none'
			});
		} else {
			$clearButton.appendTo(place)
				.click(function() {
					var $searchBox = $('#searchBox');
					$clearButton.hide();
					$input.val('').click();
				});
			$input.keyup(function() {
				if($(this).val()) {
					$('#clearSearch').show();
				} else {
					$('#clearSearch').click();
				}
			});
		}

		input.onfocus = config.macros.search.onFocus;
		
		$('#searchResults').live('click', function(e) {
			if(e.target.nodeName==="LI") {
				$(e.target).toggleClass("open");
			}
			return false;
		});
		
		/*
		this is adding specific behaviour that happens before click on panels are processed
		if click on input and there are search results, add noToggle
		if click on input and there are no search results, remove noToggle
		if keyup and there is nothing in the search string, click on input
		*/
		
		// TO-DO: clicking the clear button on the search type input should wrap up the search box
		
		$input.click(function() {
			var $searchBox = $('#searchBox'),
				$ul = $('#searchBox').find('ul.browsingTool'),
				$results = $ul.children('li, span'),
				isBlank = !$input.val(),
				isEmpty = !$results.length,
				panelClosed = $searchBox.hasClass('closed');

			if((panelClosed && !isEmpty) || (!panelClosed && isBlank)) {
				$searchBox.removeClass('noToggle');
			} else {
				$searchBox.addClass('noToggle');
			}			
			
		}).keyup(function(e) {
			// if we've started typing without clicking on the search box, it won't have opened
			if($('#searchBox').hasClass('closed')) {
				$input.click();
			}
			// if empty, click to close
			if(!$input.val()) {
				$('#searchBox').find('ul.browsingTool li').remove();
				$input.click();
			} else {
				config.macros.search.onKeyPress.call(input, e);
			}
		});
		
		$('<ul class="browsingTool" id="searchResults"></ul>').appendTo(place);
	}
};

/* aiming for:
<input type="text" placeholder="Search" />
<button id="clearSearch">&#215;</button>
<ul class="browsingTool">
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
</ul>
*/

//--
//-- Search macro
//--

config.macros.search.handler = function(place,macroName,params)
{
	var searchTimeout = null;
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick,"searchButton");
	var txt = createTiddlyElement(null,"input",null,"txtOptionInput searchField");
	if(params[0])
		txt.value = params[0];
	if(config.browser.isSafari) {
		txt.setAttribute("type","search");
		txt.setAttribute("results","5");
	} else {
		txt.setAttribute("type","text");
	}
	place.appendChild(txt);
	txt.onkeyup = this.onKeyPress;
	txt.onfocus = this.onFocus;
	txt.setAttribute("size",this.sizeTextbox);
	txt.setAttribute("accessKey",params[1] || this.accessKey);
	txt.setAttribute("autocomplete","off");
	txt.setAttribute("lastSearchText","");
};

config.macros.search.elsewhereSearch = function(text) {
	var url = '/search.json?q="%0"'.format(encodeURIComponent(text)),
		$ = jQuery,
		whitelist = store.getTiddler('Trained/Training AMBIT services manualizing their work').text.split('\n'),
		bagFilters = [];
	$('#searchResults li.loading').show();
	$.each(whitelist, function(i, line) {
		var pieces = line.split(':'),
			space = pieces[0],
			url = pieces[1];
		bagFilters.push("bag:"+space+"_public");
	});
	url += "%20("+bagFilters.join(" OR ")+")";
		
	$.ajax({
		url: url,
		dataType: "json",
		success: function(tiddlers) {
			tiddlers = $.grep(tiddlers, function(t, i) {
				return t.bag.indexOf('ambit')!==-1 && t.bag!==tiddler.fields['server.bag'];
			});
			var count = tiddlers.length;
			if(count) {
				config.extensions.AmbitSearchPlugin.displayElsewhereResults(tiddlers);
			}
		},
		error: function() {
			// show error
			$('#searchResults li.loading').hide();
		}
	});
}

// Global because there's only ever one outstanding incremental search timer
config.macros.search.timeout = null;

config.macros.search.doSearch = function(txt)
{
	if(txt.value.length > 0) {
		story.search(txt.value,config.options.chkCaseSensitiveSearch,config.options.chkRegExpSearch);
		if($('#searchBox input[type=checkbox]').prop('checked')) {
			config.macros.search.elsewhereSearch(txt.value,config.options.chkCaseSensitiveSearch,config.options.chkRegExpSearch);
		}
		txt.setAttribute("lastSearchText",txt.value);
	}
};

config.macros.search.onClick = function(e)
{
	config.macros.search.doSearch(this.nextSibling);
	return false;
};

config.macros.search.onKeyPress = function(ev)
{
	var e = ev || window.event;
	switch(e.keyCode) {
		case 13: // Ctrl-Enter
		case 10: // Ctrl-Enter on IE PC
			config.macros.search.doSearch(this);
			break;
		case 27: // Escape
			this.value = "";
			clearMessage();
			break;
	}
	if(config.options.chkIncrementalSearch) {
		if(this.value.length > 2) {
			if(this.value != this.getAttribute("lastSearchText")) {
				if(config.macros.search.timeout)
					clearTimeout(config.macros.search.timeout);
				var txt = this;
				config.macros.search.timeout = setTimeout(function() {config.macros.search.doSearch(txt);},500);
			}
		} else {
			if(config.macros.search.timeout)
				clearTimeout(config.macros.search.timeout);
		}
	}
	return true;
};

config.macros.search.onFocus = function(e)
{
	this.select();
};



/*}}}*/