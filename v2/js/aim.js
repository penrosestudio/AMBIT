function main() {
	/* requires jQuery 1.4.3+ */

	/*
		on load, create the category and items list from tiddlers tagged with whatever is appropriate
		on load, start with the first category open and the first item open; check for which questions in the first category should be "done" and which categories should be "done"
		prev/next buttons - triggers a click on the next/prev title; if at the extremes of a category, trigger click on prev/next if there is one (if opening prev, make the last question be selected, not the first) - DONE
		clicking a title closes any open item and removes "active" from its title; then opens an item and gives its title the class "active" - DONE
		opening an item should pull the content from the tiddlers and display it appropriately
		clicking a category toggles display of category contents, adds "active" to the clicked category, and removes "active" from any other categories; it also triggers a click on the first item in the category - DONE
		when closing an item, if the item is filled in, it gets the class "done"; if all the items in a category are filled in, the category gets the class "done"
		when storing "done" state, save it as a cookie
		when closing the AIMForm tiddler, assign null to $activeItem
	*/
	var $container = $('#aimForm'),
		$navArrows = $container.find('.navigation').find('a'),
		$categories = $container.children('ul').children('li'),
		$items = $categories.children('ul').children('li'),
		$activeItem,
		activeItemIndex = function() {
			return $activeItem && $activeItem.index();
		},
		openAimItem = function(title) {
			console.log('opening '+title);
		};

	$navArrows.click(function() {
		if(!$activeItem.length) {
			return;
		}
		var move = $(this).hasClass('next') ? 'next' : 'prev',
			$toOpen = $activeItem[move](),
			$newCategory;
		if($toOpen.length) {
			$toOpen.click();
		} else {
			$newCategory = $activeItem.parent().parent()[move](); // assumes a li inside a ul inside a li
			if($newCategory.length) {
				$newCategory.click();
			}
		}
	});

	$categories.click(function(e) {
		var openLast = activeItemIndex()===0,
			$items = $(this).children('ul').children('li'),
			clickIndex = openLast ? $items.length-1 : 0;
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
		return false;
	});
	
	$items.click(function(e) {
		$activeItem = $(this).addClass('active');
		$activeItem
			.siblings()
			.removeClass('active');
		openAimItem($activeItem.children('a').text());
		return false;
	});
	
	$categories.eq(0).click();
}