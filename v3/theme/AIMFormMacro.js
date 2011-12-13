/*{{{*/
var $ = jQuery;
config.macros.AIMForm = {
	categories: null,
	$activeItem: null,
	parseItemTitleRegex: new RegExp('(\\d\\d) (.*) - (.*)'),
	parseItemTitle: function(item) {
		// item.title is like "04 Young person daily life - Other talents and abilities"
		var regex = config.macros.AIMForm.parseItemTitleRegex,
			matches = regex.exec(item),
			tiddlerTitle = matches[0],
			number = matches[1],
			category = matches[2],
			label = matches[3],
			itemData = {
				tiddlerTitle: tiddlerTitle,
				number: number,
				category: category,
				label: label
			};
			return itemData;
	},
	loadItems: function(tag) {
		var items = store.getTaggedTiddlers(tag),
			aimIntro = store.getTaggedTiddlers('AIM-intro')[0],
			aimResults = store.getTaggedTiddlers('AIM-results')[0],
			$aimForm = $('#aimForm'),
			$aimMenu = $aimForm.children('ul'),
			htmlToAdd = ['<li class="category"><a href="#">'+aimIntro.title+'</a></li>\n'],
			itemData,
			category,
			categories = config.macros.AIMForm.categories;
		if(!categories) {
			categories = {};
			$.each(items, function(i, item) {
				itemData = config.macros.AIMForm.parseItemTitle(item.title);
				category = itemData.category;
				if(!categories[category]) {
					categories[category] = [];
				}
				categories[category].push(itemData);
			});
			config.macros.AIMForm.categories = categories;
		}
		$.each(categories, function(category, categoryItems) {
			categoryItems.done = true;
			$.each(categoryItems, function(j, item) {
				if(!item.value) {
					delete categoryItems.done;
				}
			});
		});
		$.each(categories, function(category, categoryItems) {
			var categoryClass = categoryItems.done ? ' class="category done"' : ' class="category"';
			htmlToAdd.push('<li'+categoryClass+'><a href="#">'+category+'</a>\n<ul>');
			$.each(categoryItems, function(i, item) {
				var itemClass = item.value ? (item.isKeyProblem ? ' class="done keyProblem"' : ' class="done"') : "";
				htmlToAdd.push('<li'+itemClass+'><a href="#">'+item.label+'</a></li>');
			});
			htmlToAdd.push('</ul>\n</li>');
		});
		htmlToAdd.push('<li><a href="#">'+aimResults.title+'</a></li>'),
		$aimMenu.html(htmlToAdd.join('\n'));
	},
	displayItem: function(tiddler, item) {
		var heading = item.number+" - "+item.label,
			description = store.getTiddlerText(tiddler.title+"##description"),
			breakdown = store.getTiddlerText(tiddler.title+"##breakdown"),
			bits = breakdown.split("<br>\n"),
			bitsRegex = new RegExp(/(\d\+?)/),
			content = wikifyStatic('!'+heading+"\n",null,tiddler) +
				"<p>" + wikifyStatic(description,null,tiddler) + 
				"</p>\n",
			breakdownPieces = [],
			existingValue = item.value,
			isKeyProblem = item.isKeyProblem,
			$item;
		// add key problem checkbox
		breakdownPieces.push('<div class="choice">\n' +
			'<input type="checkbox" value="yes" name="key_problem" class="choice" id="key_problem" />\n' +
			'<label id="key_problem_label" for="key_problem"><strong>Is this a key problem?</strong></label>\n' +
			'</div>');
		$.each(bits, function(i, bit) {
			var matches = bitsRegex.exec(bit),
				value = matches && matches[1];
			if(value) {
				breakdownPieces.push('<div class="choice">\n' +
					'<input type="radio" value="'+value+'" name="question" class="choice" id="'+value+'" />\n' +
					'<label for="'+value+'">'+wikifyStatic(bit,null,tiddler)+'</label>\n' +
					'</div>');
			}
		});
		content += breakdownPieces.join('\n');
		$item = $('#aimForm div.question div.item');
		$item.next('div.error').remove();
		$item.html(content);
		if(existingValue) {
			$item.find('input[value="'+existingValue+'"]').attr('checked','checked');
		}
		if(isKeyProblem) {
			$item.find('input[type=checkbox]').attr('checked','checked');
		}
		$item.find('input[type=checkbox]').change(function(e) {
			var plugin = config.macros.AIMForm,
				keyProblemCount = plugin.keyProblemCount || 0;
			$item.next('div.error').remove();
			if(!$('#aimForm').find('div.item input[type=radio]:checked').length) {
				$('<div class="error">Please choose an option first</div>').insertAfter($item);
				this.checked = false;
				return true; // don't pay attention if there is no item selected
			}
			if(this.checked) {
				if(keyProblemCount>=6) { // this allows six to be selected
					$('<div class="error">'+store.getRecursiveTiddlerText('AIMFormKeyProblemErrorMessage', 'too many key problems selected', 0)+'</div>').insertAfter($item);
					this.checked = false;
				} else {
					plugin.keyProblemCount = ++keyProblemCount;
					// make the item active
					config.macros.AIMForm.$activeItem.addClass("keyProblem");
				}
			} else {
				plugin.keyProblemCount = --keyProblemCount;
				// make the item inactive
				config.macros.AIMForm.$activeItem.removeClass("keyProblem");
			}
		});
	},
	closeItem: function($activeItem) {
		if(!$activeItem || $activeItem.hasClass('category')) {
			return false;
		}
		var $openItem = $('#aimForm').find('div.item'),
			$selected = $openItem.find('input[type=radio]:checked'),
			value = $selected.val(),
			isKeyProblem = !!$openItem.find('input[type=checkbox]:checked').length,
			$uncheckedItems,
			item = config.macros.AIMForm.getItemFromElement($activeItem);
		if(value && item) {
			$activeItem.addClass("done");
			$uncheckedItems = $activeItem.siblings().filter(function() {
				return !$(this).hasClass("done");
			});
			if($uncheckedItems.length===0) {
				$activeItem.parent().parent().addClass("done");
			}
			item.value = value;
			item.isKeyProblem = isKeyProblem;
			// setOption("AIM_"+item.tiddlerTitle,value); - Do this if I want to save between sessions in cookies
		}
	},
	getItemFromElement: function($item) {
		var categories = config.macros.AIMForm.categories,
			category = $item.parent().parent().children('a').text(),
			items = categories[category],
			label = $item.children('a').text(),
			matchingItem;
		if(items) {		
			$.each(items, function(i, item) {
				if(item.label===label) {
					matchingItem = item;
					return false;
				}
			});
		}
		return matchingItem;
	},
	getAllItems: function() {
		var items = {};
		$.each(config.macros.AIMForm.categories, function(i, category) {
			$.each(category, function(j, item) {
				items[item.tiddlerTitle] = item;
			});
		});
		return items;
	},
	addBehaviour: function() {
		var $container = $('#aimForm'),
			$navArrows = $container.find('.navigation').find('a'),
			$categories = $container.children('ul').children('li'),
			$items = $categories.children('ul').children('li'),
			plugin = config.macros.AIMForm,
			$itemHolder = $container.find('div.question'),
			clickedPrev,
			openAimItem = function($item) {
				var item = config.macros.AIMForm.getItemFromElement($item),
					tiddler = store.getTiddler(item.tiddlerTitle);
				config.macros.AIMForm.displayItem(tiddler,item);
			},
			findToOpen = function(selector) {
				var move = $(selector).hasClass('next') ? 'next' : 'prev',
					$toOpen = plugin.$activeItem[move](),
					$newCategory;
				if($toOpen.length) {
					return $toOpen;
				} else {
					if(plugin.$activeItem.hasClass('category')) {
						$newCategory = plugin.$activeItem[move]();
					} else {
						$newCategory = plugin.$activeItem.parent().parent()[move](); // assumes a li inside a ul inside a li
					}
					if($newCategory.length) {
						return $newCategory;
					}
				}
			},
			toggleNavArrows = function() {
				$navArrows.each(function(i, arrow) {
					if(!findToOpen(arrow)) {
						$(arrow).css('visibility','hidden');
					} else {
						$(arrow).css('visibility','visible');
					}
				});
			};
	
		$navArrows.click(function() {
			if(!plugin.$activeItem) {
				return false;
			}
			var $toOpen = findToOpen(this);
			if($toOpen.length) {
				$toOpen.click();
			}
			return false;
		});
	
		$categories.click(function(e) {
			var openLast = false,
				$items = $(this).children('ul').children('li'),
				clickIndex = openLast ? $items.length-1 : 0,
				title,
				tiddler,
				content,
				$nextButton,
				$place = $('#aimForm div.question div.item');
			if($items.length) {
				$(this)
					.addClass('active')
					.children('ul')
					.show()
					.end()
					.siblings()
					.removeClass('active')
					.children('ul')
					.hide();
				$items.eq(clickIndex).click();
			} else {
				// it has no children, so it's probably the intro or results
				config.macros.AIMForm.closeItem(plugin.$activeItem);
				title = $(this).find('a').text();
				tiddler = store.getTiddler(title);
				plugin.$activeItem = $(this).addClass('active');
				plugin.$activeItem
					.siblings()
					.removeClass('active');
				/*content = wikifyStatic('!~'+tiddler.title+"\n",null,tiddler) +
					"<p>" + wikifyStatic(tiddler.text,null,tiddler) + 
					"</p>\n";*/
				//$('#aimForm div.question div.item').html(content);
				wikify('!~'+tiddler.title+"\n",$place.empty().get(0));
				wikify(tiddler.text, $place.get(0));
				/*if($('#aimForm input[option]').length) {
					$('#aimForm input[option]').change(function(e) {
						config.macros.option.genericOnChange.apply(this,arguments);
					});
				}*/
				toggleNavArrows();
			}
			return false;
		});
		
		$items.click(function(e) {
			config.macros.AIMForm.closeItem(plugin.$activeItem);
			plugin.$activeItem = $(this).addClass('active');
			plugin.$activeItem
				.siblings()
				.removeClass('active');
			openAimItem(plugin.$activeItem);
			toggleNavArrows();
			return false;
		});
		$categories.eq(0).click();
	},
	handler: function(place,macroName,params) {
		var template = params[0],
			tag = params[1];
		$(place).append(store.getTiddler(template).text);
		config.macros.AIMForm.loadItems(tag);
		config.macros.AIMForm.addBehaviour();
	}
};

/*}}}*/