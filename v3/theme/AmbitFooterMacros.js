/*{{{*/
config.macros.footerSlider = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var $ = jQuery,
			$sliderButton = $('<a class="slider button" title="Show or hide related information for this tiddler">show/hide related information</a>').appendTo(place),
			$topicsContainer = $("<div></div>")
				.appendTo(place)
				.css('display', 'none'),
			topicsElem = $topicsContainer.get(0);
		$sliderButton.click(function() {
			$topicsContainer.slideToggle();
		});
		config.macros.ambitTags.handler(topicsElem,"ambitTags",params,wikifier,paramString,tiddler);
		$topicsContainer.append("<br />");
		config.macros.ambitTagging.handler(topicsElem,"ambitTags",params,wikifier,paramString,tiddler);
		$topicsContainer.append("<br />");
	}
};

// based on tags macro
config.macros.ambitTags = {};
config.macros.ambitTags.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	params = paramString.parseParams("anon",null,true,false,false);
	var ul = createTiddlyElement(place,"ul");
	var title = getParam(params,"anon","");
	if(title && store.tiddlerExists(title))
		tiddler = store.getTiddler(title);
	var sep = getParam(params,"sep"," ");
	var lingo = config.views.wikified.tag;
	if(tiddler.tags.length===0) {
		createTiddlyElement(ul,"li",null,null,"no topic");
	}
	for(var t=0; t<tiddler.tags.length; t++) {
		var tag = store.getTiddler(tiddler.tags[t]);
		if(!tag || !tag.tags.contains("excludeLists")) {
			createTagButton(createTiddlyElement(ul,"li"),tiddler.tags[t],tiddler.title);
			if(t<tiddler.tags.length-1)
				createTiddlyText(ul,sep);
		}
	}
};

// based on tagging macro
config.macros.ambitTagging = {};
config.macros.ambitTagging.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	params = paramString.parseParams("anon",null,true,false,false);
	var ul = createTiddlyElement(place,"ul");
	var title = getParam(params,"anon","");
	if(title == "" && tiddler instanceof Tiddler)
		title = tiddler.title;
	var sep = getParam(params,"sep"," ");
	ul.setAttribute("title",config.macros.tagging.tooltip.format([title]));
	var tagged = store.getTaggedTiddlers(title);
	if(tagged.length===0) {
		createTiddlyElement(ul,"li",null,"listTitle","no topics");
	} else {
		for(var t=0; t<tagged.length; t++) {
			if(!tagged[t].tags || !tagged[t].tags.contains("excludeLists")) {
				createTiddlyLink(createTiddlyElement(ul,"li"),tagged[t].title,true);
				if(t<tagged.length-1)
					createTiddlyText(ul,sep);
			}
		}
	}
};

// newHere plugin - http://mptw.tiddlyspot.com/#NewHerePlugin
config.macros.newHere = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		$(place).attr({
			refresh: 'macro',
			macroName: 'newHere'
		}).data('args', arguments);
		wikify("<<newTiddler "+paramString+" tag:[["+tiddler.title+"]]>>",place,null,tiddler);
	},
	refresh: function(place, params) {
		var args = $(place).empty().data('args');
		this.handler.apply(this, args);
	}
};

config.macros.ambitRevisions = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		config.macros.toolbar.createCommand(place,"revisions",tiddler);
	}
};

config.macros.ambitReferences = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		config.macros.toolbar.createCommand(place,"references",tiddler);
	}
};

(function($) {
	$(document).bind('startup', function() {
		$('.panelToggle').live('click', function() {
			$(this)
				.toggleClass('open')
				.closest('.headingPanel')
				.find('.infoPanel')
				.slideToggle();
			return false;
		});
	});
}(jQuery))


config.macros.ambitElsewhere = {
	searchURL: '/search.json?q=title:"%0"',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var url = config.macros.ambitElsewhere.searchURL.format(encodeURIComponent(tiddler.title)),
			$ = jQuery,
			whitelist = store.getTiddler('AMBIT community of practice - members').text.split('\n'),
			bagFilters = [];
		$.each(whitelist, function(i, line) {
			var pieces = line.split(':'),
				space = pieces[0];
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
				$(place).prepend(count);
				if(count) {
					config.macros.ambitElsewhere.wrapWithElsewhereLink(place, tiddlers, tiddler);
				}
			},
			error: function() {
				$(place).prepend('(error)');
			}
		});
	},
	wrapWithElsewhereLink: function(place, tiddlers, tiddler) {
		var $ = jQuery;
		var $place = $(place)
			.wrap("<a></a>")
			.parent().click(function() {
				var popup = Popup.create(this),
					$ul,
					bag,
					space,
					diffURL = "diff?rev1=bags/"+tiddler.fields['server.bag']+"/"+encodeURIComponent(tiddler.title)+"/"+tiddler.fields['server.page.revision']+"&rev2=bags/<bag>/"+encodeURIComponent(tiddler.title)+"/<revision>&format=horizontal";
				if(popup) {
					$popup = $(popup);
					$.each(tiddlers, function(i, t) {
						bag = t.bag;
						space = bag.substring(0, bag.lastIndexOf('_'));
						$popup.append('<li><a href="'+diffURL.replace("<bag>",bag).replace("<revision>",t.revision)+'" target="_blank">'+space+'</li>');
					});
				}
				Popup.show();
				return false;
			});
	}
};

/*}}}*/