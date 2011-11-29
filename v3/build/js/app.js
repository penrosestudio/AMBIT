//background position functions
		
		function getBgPosY(elem) {
			var bgPos = $(elem).css('backgroundPosition');
			if(bgPos) {
				return bgPos.split(" ")[1];
			}
		}
		function setBgPosY(elem, pos) {
			var bgPos = $(elem).css('backgroundPosition'),
				posX;
			if(bgPos) {
				posX = bgPos.split(" ")[0];
				$(elem).css('backgroundPosition', posX+" "+pos);
			}
		}
	
		$(document).ready(function() {
			
			// the sidebar
			
			$('#sidebarIcons').click(function(e) {
				e.preventDefault();
				var curLeft = parseInt($('#sidebar').css('left'),10),
					open = curLeft===0,
					viewportWidth = $(window).width(),
					$target = $(e.target),
					$panel = $('#sidebar').find('.panel').eq($target.index()-1);
				if($target.attr('id')==="toggle") {				
					$('#sidebar').animate( {
						left: open ? "-260px" : "0px"
					}, 200);
					// determine whether the screen is wide enough to centre between the statuspanel and sidebar
					if (viewportWidth>=1260) {
						$('#screenWidth').animate( {
							width: open ? viewportWidth-240 : viewportWidth-540,
							right: open ? "240px" : "240px"
						}, 200);
					}
					setBgPosY('#toggle', open ? "-540px" : "-490px");
				} else {
					if(!open) {
						$('#toggle').click();
					}
					if($target.attr('id')==="search") {
						$('#searchBox').children('input').click().focus();
					} else {
						if($panel.hasClass("closed")) {
							$panel.children('h2').click();
						}
					}
				}
			});
			
			/*
				sidebar toggle 
					always toggles sidebar in/out
			
				click on icon
					if sidebar is open  
						opens accordion section
					if sidebar is closed 
						opens accordion section and sidebar
					
				
				-width
					find screen width
					when sidebar opens
						change #screenWidth to be screen width minus the width of the sidebar
					when sidebar closes
						vice versa
						
					240
					
					if the #screenwidth is large enough for the statuspanel to not overlap the tiddlers
						centre the tiddler content between the statuspanel and the extended sidebar
					
					is the screenwidth wide enough? 
						statuspanel+padding = 240px
						sidebar+padding 	= 300px
						tiddler				= 720px
						
						Total				= 1260px
						
						so if viewport width is 1260+, add right:240px and width:-240 to #screenWidth 
						
						if sidebar is closed and width is 1000+, add right:240px and width:-240 to #screenWidth 
			
			*/
			
			
			// the accordion
			
			$('#sidebar .panel h2, #sidebar #searchBox input').click( function(e){
				var $thisPanel = $(this).parent('.panel'),
					$otherPanels = $('#sidebar .panel').not($thisPanel),
					viewportHeight = $(window).height() / 3,
					isClosed = $thisPanel.hasClass('closed');
				// make sure all other panels are closed
				$otherPanels.each(function() {
					var $panel = $(this),
						$ul = $panel.find('ul.browsingTool'),
						panelClosed = $panel.hasClass('closed');
					if(!$ul.length) {
						return;
					}
					if(!panelClosed) {
						$ul.stop().animate({
							height: 0
						}, function() {
							$panel.addClass('closed');
						});
						setBgPosY($panel.find('h2'), "-391px");
					}
				});
				// toggle this panel
				$thisPanel.find("ul.browsingTool").stop().animate({
					height: isClosed ? viewportHeight : 0
				}, function() {
					if(isClosed) {
						$thisPanel.removeClass('closed');
					} else {
						$thisPanel.addClass('closed');
					}
				});
				setBgPosY($thisPanel.find('h2'), isClosed ? "-437px" : "-391px");
			});
			
			// horizontal positioning (I was going to alter the H position of the main page when the sidebar was open)
			
			
			
			// if ($('li:last').is(':visible')) { //go back to first element } -
			
			// the info toggle
			
			$('.infoToggle a').click(function() {
				$(this).parent().siblings('div.info').slideToggle(200, function() {
					if ($(this).is(':visible')) {
						$('.infoToggle a span').text('-');
					} else {
						$('.infoToggle a span').text('+');
					}
				});
				return false;
			});
			
			// the status toggle
			
			$('#statusPanel a.current').click(function() {
				$(this).parent().next('div.dropDown').slideToggle(100);
				$(this).toggleClass('open');
				return false;
			});
			
			$('#statusPanel').mouseleave(function() {
				if ($('div.dropDown').is(':visible')) {
					$('div.dropDown').slideUp(100);
					$('#statusPanel a.current').removeClass('open');
				}
			});

			
			// Screen Width / Positioning
			
			
			
			
		});