//{{{
var $ = jQuery;

config.macros.exportAIM = {
	tag: 'AIM',
	csv: "",
	setup: false,
	handler: function(place) {
		$(place).append('<a href="#" class="export marginbottomsmall" title="Export AIM to CSV">Export AIM</a>');
		this.setBehaviour();
	},
	setBehaviour: function() {
		if(this.setup) {
			return;
		}
		$('#aimForm').live('click', function(e) {
			if($(e.target).hasClass('export')) {
				config.macros.exportAIM.exportCSV();
			}
		});
		this.setup = true;
	},
	exportCSV: function() {
		var aimFormItems = config.macros.AIMForm.getAllItems(),
			csv = "",
			fields,
			score,
			keyOnly,
			newWindow,
			newDocument,
			interventionLabel,
			interventions,
			writeInterventionsList = function(newDocument, interventions) {
				newDocument.write("<ul>");
				$.each(interventions, function(i, intervention) {
					newDocument.write("<li>"+intervention.name+"<ul>");
					$.each(intervention.AIMitems, function(j, AIMitem) {
						newDocument.write("<li>"+AIMitem.title+" (rating "+aimFormItems[AIMitem.title].value+")</li>");
					});
					newDocument.write("</ul></li>");
				});
				newDocument.write("</ul>");	
			};
		$.each(aimFormItems, function(i, AIMitem) {
			if(AIMitem.value) {
				csv += '"'+AIMitem.tiddlerTitle+'","'+AIMitem.value+'","'+(AIMitem.isKeyProblem ? 'key problem' : '')+'"\n';
			}
		});
		if(!csv) {
			csv = "the AIM has not been filled in yet";
		}
		config.macros.exportAIM.csv = csv;
		newWindow = window.open("", "sourceWindow", "width=700,height=600,scrollbars=yes");
		newWindow.focus();
		newDocument = newWindow.document;
		newDocument.write("<html><head><title>AIM export to CSV</title>" +
			'<style type="text/css">textarea { border: 2px inset #B5B5B5; width: 100%; }</style>' +
			"</head><body onload=\"var exp = function() { window.opener.config.macros.exportAIM.save(); window.close(); }; var button = document.getElementsByTagName('button')[0]; if(button) { button.onclick=exp; } document.getElementsByTagName('textarea')[0].select();  \">" +
			"<h1>AIM export to CSV</h1>" +
			"<h2>Form information:</h2>" +
			"<dl><dt>Name/Unique ID:</dt><dd>"+(config.options.txtAIM_ID || "not filled in")+"</dd>" +
			"<dt>Date of assessment</dt><dd>"+(config.options.txtAIM_date || "not filled in")+"</dd>" +
			"<dt>Name of assessor</dt><dd>"+(config.options.txtAIM_assessor || "not filled in")+"</dd></dl>" +
			"<hr />");
		if(!config.options.txtAIM_ID || !config.options.txtAIM_date || !config.options.txtAIM_assessor) {
			newDocument.write("<p>Please go back and fill in the undefined details above</p><hr/>");
		}
		newDocument.write(wikifyStatic("<<tiddler ExportAIMInstructions>>") +
			"<textarea>" +
			csv +
			"</textarea>");
		newDocument.write("<h2>List of specific interventions:</h2>");
		// now show the list of interventions, if there are any
		keyOnly = true;
		interventions = config.macros.AIMResults.createResults(keyOnly);
		config.macros.AIMResults.analyseResults(interventions, "global_ranking");
		newDocument.write("<h3>Global ranking (key problems only):</h3>");
		writeInterventionsList(newDocument, interventions);
		config.macros.AIMResults.analyseResults(interventions, "focal_ranking");
		newDocument.write("<h3>Focal ranking (key problems only):</h3>");
		writeInterventionsList(newDocument, interventions);
		keyOnly = false;
		interventions = config.macros.AIMResults.createResults(keyOnly);
		config.macros.AIMResults.analyseResults(interventions, "global_ranking");
		newDocument.write("<h3>Global ranking (all results):</h3>");
		writeInterventionsList(newDocument, interventions);
		config.macros.AIMResults.analyseResults(interventions, "focal_ranking");
		newDocument.write("<h3>Focal ranking (all results):</h3>");
		writeInterventionsList(newDocument, interventions);
		newDocument.write("</body></html>");
		newDocument.close();
	},
	save: function() {
		// TiddlyTemplating.saveFile - http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/TiddlyTemplatingMacro.js
		var filename = (config.options.txtAIM_ID+"_"+config.options.txtAIM_date+"_"+config.options.txtAIM_assessor+".csv").replace(/ /g," "),
			content = config.macros.exportAIM.csv.replace(/<br\/>/g,"\n"),
			localPath = getLocalPath(document.location.toString()),
			savePath,
			p,
			fileSave;

		config.messages.fileSaved = "file successfully saved";
		config.messages.fileFailed = "file save failed";
		if((p = localPath.lastIndexOf("/")) != -1) {
			savePath = localPath.substr(0,p) + "/" + filename;
		} else {
			if((p = localPath.lastIndexOf("\\")) != -1) {
				savePath = localPath.substr(0,p) + "\\" + filename;
			} else {
				savePath = localPath + "." + filename;
			}
		}
		alert("saving AIM to file: "+savePath);
		fileSave = saveFile(savePath,convertUnicodeToUTF8(content));
		if(fileSave) {
			displayMessage("saved... click here to load","file://"+savePath);
		} else {
			displayMessage(config.messages.fileFailed,"file://"+savePath);
		}
	}
};
//}}}