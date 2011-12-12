/*{{{*/
var $ = jQuery;

config.macros.AIMResults = {
	setup: false,
	createResults: function(keyOnly) {
		var interventions = store.getTaggedTiddlers('SpecificInterventions'),
			relatedAIMitems,
			aimFormItems = config.macros.AIMForm.getAllItems(),
			interventionObj,
			results = [];
		$.each(interventions, function(i, intervention) {
			relatedAIMitems = store.getTaggedTiddlers(intervention.title);
			relatedAIMitems = $(relatedAIMitems).filter(function() {
				return aimFormItems[this.title];
			});
			relatedAIMitems.sort(function(a,b) {
				return aimFormItems[a.title].value < aimFormItems[b.title].value ? +1 : (aimFormItems[a.title].value === aimFormItems[b.title].value ? 0 : -1);
			});
			interventionObj = {
				name: intervention.title,
				AIMitems: []
			};
			$.each(relatedAIMitems, function(j, item) {
				var aimFormItem = aimFormItems[item.title];
				if(aimFormItem.value >= 2) {
					if(!keyOnly || aimFormItem.isKeyProblem) {
						interventionObj.AIMitems.push(item);
					}
				}
			});
			if(interventionObj.AIMitems.length>0) {
				results.push(interventionObj);
			}
		});
		return results;
	},
	onChange: function(e) {
		if(!$(e.target).hasClass('resultsRadio')) {
			return true;
		}
		var keyOnly = $('#AIMResultsContainer').find('input[type=checkbox]').attr('checked'),
			label = $('#AIMResultsContainer').find('input[type=radio]:checked').attr('id'),
			aimFormItems = config.macros.AIMForm.getAllItems(),
			$resultsContainer = $("#AIMResults").empty(),
			place = $resultsContainer.get(0),
			results = [],
			interventionLabel;
		results = config.macros.AIMResults.createResults(keyOnly);
		if(results.length===0) {
			$resultsContainer.append('no AIM items to show');
		} else {
			wikify('!!Intervention suggestions:', place);
			interventionLabel = config.macros.AIMResults.analyseResults(results, label);
			$.each(results, function(i, intervention) {
				var intCount = (intervention.count === Math.floor(intervention.count)) ? Math.floor(intervention.count) : intervention.count.toFixed(1),
					label = intervention.count === 1 ? interventionLabel.single : interventionLabel.multi,
					toWikify = '* [['+intervention.name+']] ('+intCount+' '+label+') <html><a class="revealItems" href="#" title="Click to view matching AIM items">View AIM items</a></html>\n';
				$.each(intervention.AIMitems, function(j, AIMitem) {
					toWikify += "** [["+AIMitem.title+"]] (rating "+aimFormItems[AIMitem.title].value+")\n";
				});
				wikify(toWikify, place);
			});
			$(place).find('a.revealItems').click(function() {
				$(this).closest('li').children('ul').toggle();
				return false;
			});
		}
	},
	analyseResults: function(results, label) {
		var interventionLabel,
			aimFormItems = config.macros.AIMForm.getAllItems();
		switch(label) {
			case "global_ranking":
				interventionLabel = {
					single:"AIM item",
					multi:"AIM items"
				};
				$.each(results, function(i, interventionObj) {
					interventionObj.count = interventionObj.AIMitems.length;
				});
				results.sort(function(a,b) {
					return a.AIMitems.length < b.AIMitems.length ? +1 : (a.AIMitems.length === b.AIMitems.length ? 0 : -1);
				});
				break;
			case "focal_ranking": // weighted algorithm
				interventionLabel = {
					single:"average score",
					multi:"average score"
				};
				$.each(results, function(i, interventionObj) {
					var AIMitems = interventionObj.AIMitems,
						count = 0;
					$.each(AIMitems, function(j, AIMitem) {
						var score = aimFormItems[AIMitem.title].value;
						count += parseInt(score,10);
					});
					interventionObj.count = count / AIMitems.length;
				});
				results.sort(function(a,b) {
					return a.count < b.count ? +1 : (a.count === b.count ? 0 : -1);
				});
				break;
			default:
				// do nothing
				break;
		}
		this.results = results;
		return interventionLabel;
	},
	setBehaviours: function() {
		if(this.setup) {
			return;
		}
		$("#aimForm").live('change',this.onChange);
		this.setup = true;
	},
	handler: function(place, macroName, params) {
		$("<p>Display the AIM's suggested interventions, sorted according to:</p>").appendTo(place);
		var $container = $('<div id="AIMResultsContainer"></div>').appendTo(place),
			createChoiceHtml = function(label, name, text, type) {
				return '<div class="choice"><input class="resultsRadio" type="'+type+'" name="'+name+'" id="'+label+'" /><label for="'+label+'">'+text+'</label></div>';
			};
		$(createChoiceHtml('global_ranking', 'algorithm_choice', '<strong>GLOBAL RANKING</strong> - each suggested intervention is ranked according to how many different problems (that is AIM items scoring greater than 2) the young person has which that particular intervention is relevant for. This is good for COVERING THE WHOLE SET OF PROBLEMS AND CAUSES.', 'radio'))
				.appendTo($container)
				.find('input')
				.get(0);
		$(createChoiceHtml('focal_ranking', 'algorithm_choice', '<strong>FOCAL RANKING</strong> - each suggested intervention is ranked in order of how SEVERE the set of problems are (their averaged AIM scores) that indicate that particular intervention. This is good for FOCUSING ON THE MOST SEVERE PROBLEMS.', 'radio'))
				.appendTo($container)
				.find('input')
				.get(0);
		$(createChoiceHtml('limit_ranking', 'limit', '<strong>LIMIT</strong> suggested interventions only to those relevant for items identified as KEY PROBLEMS.', 'checkbox'))
				.appendTo($container)
				.find('input')
				.get(0);
		$container.append('<br class="clearboth" /><div id="AIMResults"></div>');
		this.setBehaviours();
	}
};


/*}}}*/