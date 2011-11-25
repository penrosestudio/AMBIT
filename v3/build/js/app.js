//background position functions
		
		function getBgPosY(elem) {
			return $(elem).css('backgroundPosition').split(" ")[1];
		}
		function setBgPosY(elem, pos) {
			var posX = $(elem).css('backgroundPosition').split(" ")[0];
			$(elem).css('backgroundPosition', posX+" "+pos);
		}
	
		$(document).ready(function() {
			
			// the sidebar
			
			$('#sidebarIcons').bind("click", function(e) {
				e.preventDefault();
				var curLeft = parseInt($('#sidebar').css('left'),10),
					viewportWidth = $(window).width();
				
				$('#sidebar').animate( {
					left: curLeft===0 ? "-260px" : "0px"
				}, 200);
				
				if (viewportWidth>=1260) { // determine whether the screen is wide enough to centre between the statuspanel and sidebar
					$('#screenWidth').animate( {
					width: curLeft===0 ? viewportWidth-240 : viewportWidth-540,
					right: curLeft===0 ? "240px" : "240px"
				}, 200);
				}
				setBgPosY('#toggle', curLeft===0 ? "-540px" : "-490px");
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
			
			$('#sidebar h2 a').click( function(){
				var $thisPanel = $(this).closest('.panel'),
					$uls = $('#sidebar .panel').not($thisPanel).find('ul.browsingTool'),
					$thisHeader = $(this).parent('h2'),
					$headers = $('#sidebar h2').not($thisHeader),
					viewportHeight = $(window).height() / 3;
				$uls.animate({
					height: "0px"
				});
				setBgPosY($headers, "-391px");
				$thisPanel.find("ul.browsingTool").animate({
					height: viewportHeight
				});
				setBgPosY($thisHeader, "-437px");
					
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