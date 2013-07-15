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
					$('#searchResults').empty(); // TO-DO: make this happen when clear button is pressed in safari
					$input.val('').click().focus();
				});
			$input.keyup(function() {
				if($(this).val()) {
					$('#clearSearch').show();
				} else {
					//$('#clearSearch').click();
				}
			});
		}

		input.onfocus = config.macros.search.onFocus;
		
		$('#searchResults').live('click', function(e) {
			if(e.target.nodeName==="LI") {
				$(e.target).toggleClass("open");
			}
			return true;
		});
		
		$('#allManuals').change(function() {
			config.macros.search.doSearch(input);
		});
		
		/*
		this is adding specific behaviour that happens before click on panels are processed
		if click on input and there are search results, add noToggle
		if click on input and there are no search results, remove noToggle
		if keyup and there is nothing in the search string, click on input
		*/
		
		/* 
		search box behaviours v2 (as per Oct 4th 2012):
		- when clear button clicked
		-- close panel
		-- empty search input
		-- empty results list
		- when term searched for
		-- open panel
		-- empty results list
		-- show search results
		- click on input
		-- if results, show results

		*/
		
		$input.click(function() {
			var $searchBox = $('#searchBox'),
				$ul = $('#searchBox').find('ul.browsingTool'),
				$results = $ul.children('li, span'),
				isBlank = !$input.val(),
				isEmpty = !$results.length,
				panelClosed = $searchBox.hasClass('closed');
			//console.log('input click', 'val: '+$input.val(), 'panelClosed: '+panelClosed, 'isBlank: '+isBlank, 'isEmpty: '+isEmpty);
			//if((panelClosed && !isEmpty) || (!panelClosed && isBlank)) {
			if(panelClosed && isEmpty) {
				// if the panel is closed and there are no search results, don't allow the panel to be opened
				$searchBox.addClass('noToggle');
			} else if(!panelClosed && !isBlank || panelClosed && isBlank) {
				// if the panel is open and there is something in the input box, don't allow the panel to be closed
				// if the panel is closed and there is nothing in the input box, don't allow the panel to be opened
				$searchBox.addClass('noToggle');
			} else {
				$searchBox.removeClass('noToggle');
			}
			if(isBlank) {
				// erase last search history so we can trigger a new search later
				$input.attr('lastSearchText','');
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
		whitelist = store.getTiddler('AMBIT community of practice - members').text.split('\n'),
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
			} else {
				$('#searchResults li.loading').text('no results found in other manuals');
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