/*{{{*/
/*
Summary:
It turns out that syncing via a queue is more complicated than it appears at first glance. The unexpected problem comes from the choice of where in the AJAX function stack you choose to intercept and queue; the problem itself is with AJAX callback functions. This is down to the nature of JavaScript functions - references from functions to properties sitting outside the function (and closures) mean that a round-trip stringification and re-evaluation of a function does not necessarily give you back what you started with. Couple this with local storage that only stores strings, and you have the problem: storage does not store function state. In this implementation, I chose to intercept at $.ajax, which is several levels down the call stack from where the AJAX journey starts - this means the callbacks that are expected to be called on a successful or failed AJAX request have to be re-created in this plugin. An alternative implementation could intercept at a different level in the stack - it is tempting to experiment with intercepting at the very first function call in the AJAX journey, effectively just storing the new data, before the asynchronous dance of functions and callbacks has begun.

TO-DO:
- showing the stored changes when you reload a manual and view an unsynced tiddler (at the moment, it just shows you whatever the manual contains)
- putting the notification messages into tiddlers
- handle what happens if the storage gets full up (5MB on pretty much everything except IE6&7, which have 128kB. 128kB is about 64 pages of text) - I suggest we alert people when they are getting close to their limit of offline changes... this needs looking into
- make it so that if sync is called while a sync is ongoing, don't sync again (or if you let multiple syncs happen, make sure things don't get messed up) (and if there is a pending fade, that this is cancelled)

Procedure:
- hijack $.ajax and store the resource in a queue
- the queue is incrementally synced
- no functions are stored, so callbacks have to be provided by binding to the sync events

Requires:
- jQuery
- jQuery-JSON
- jStorage

tests for flow - PUT only

- override $.ajax

app logic
- given a save, it should add the resource to the unsynced queue and trigger a sync
-- override ServerSideSavingPlugin.reportSuccess and reportFailure so they don't show messages
- given a syncStart event, it should show a status bar and any unsynced list
- given a syncFail event, it should show an error message and show the list of unsynced things
- if offline, it should show an offline notification
- if online, it should trigger another sync attempt
-- if determining offlineness is not implemented, can just wait for manual syncs
- given a syncSuccess event, refresh the unsynced list to clear the synced resource
- given a syncComplete event, show a success message

SYNC module
- on load, it should check the unsynced list; if there is something in it, it should trigger a syncFail event
- sync:
- given a sync trigger, it should attempt to sync the first element in the sync queue
- it should fire a syncStart event when starting syncing
- on fail, it should fire a syncFail event
- on success, it should fire a syncSuccess event; if there are more resources to sync, it should trigger another sync attempt; if not, it should fire a syncComplete event
- getUnsynced: it should return the unsynced list

*/
(function($) {

	var SyncPlugin = function() {
			var plugin = this,
				_ajax = $.ajax;
			plugin.addToQueue = function(options) {
				// storage doesn't store functions, so remove them
				$.each(options, function(key, value) {
					if(typeof value==="function") {
						delete options[key];
					}
				});
				$.jStorage.set(options.url,options);
				//console.log('addToQueue',options);
			};
			plugin.getUnsynced = function() {
				return $.jStorage.index() || [];
			};
			plugin.getFromQueue = function(key) {
				var item = $.jStorage.get(key);
				item.success = function() {
					//console.log('put success',arguments);
					$(document).trigger("syncSuccess", [item]);
					$.jStorage.deleteKey(item.url);
					if(plugin.nextUnsynced()) {
						plugin.sync();
					} else {
						$(document).trigger("syncComplete");
					}
				};
				item.error = function(jqXHR, textStatus, errorThrown) {
					$(document).trigger("syncFail",[item ,jqXHR, textStatus, errorThrown]);
					//console.log('put fail',arguments);
				};
				return item;
			};
			plugin.clearStorage = function() {
				$.jStorage.flush();
				return $(document).trigger("syncFlush");
				
			};
			plugin.nextUnsynced = function() {
				var key = plugin.getUnsynced()[0];
				if(key) {
					return plugin.getFromQueue(key);
				}
			};
			plugin.sync = function() {
				var item = plugin.nextUnsynced();
				if(item) {
					//console.log('sync');
					$(document).trigger("syncStart",[item]);
					plugin.putItem(item);
				}
			};
			plugin.putItem = function(item) {
				//console.log('PUTing',item);
				return _ajax(item);
			};
			$.ajax = function(options) {
				if(options.type && options.type.toLowerCase()==="put" && options.url.indexOf("/tiddlers/")!==-1) {
					plugin.addToQueue(options);
					plugin.sync();
				} else {
					_ajax.apply(this,arguments);
				}
			};
			return plugin;
		};

	// now for the Tiddly bits and app logic - you would normally have this in a separate file
	var statusMessage = {
		messages: {
			syncing: store.getTiddlerSlice('SyncPluginMessages', 'syncing'),
			error: store.getTiddlerSlice('SyncPluginMessages', 'error'),
			flush: store.getTiddlerSlice('SyncPluginMessages', 'flush'),
			complete: store.getTiddlerSlice('SyncPluginMessages', 'complete'),
			unsyncedNote: store.getTiddlerSlice('SyncPluginMessages', 'unsyncedNote')
		},
		// all tiddlers will show the same message box
		getStatusBoxes: function() {
			// first of all, make sure each tiddler has a status box - it's possible that there isn't one yet
			$('.tiddler').each(function() {
				if(!$(this).find('.statusBox').length) {
					insertStatusBox(this);
				}
			});
			return $('.statusBox');
		},
		getTiddlerFromURL: function(url) {
			return url && decodeURIComponent(url.substring(url.lastIndexOf('/')+1));
		},
		updateStatusBox: function(status) {
			var $boxes = this.getStatusBoxes();
			//console.log('uSB boxes',$boxes);
			switch(status) {
				case "syncing":
					$boxes.removeClass('error success').addClass('pending')
						.find('.syncTitle').text(statusMessage.messages.syncing).end()
						.show();
					this.updateSyncList();
					//console.log('syncing',$boxes.find('.syncTitle').text());
					break;
				case "error":
					$boxes.removeClass('pending success').addClass('error')
						.find('.syncTitle').text(statusMessage.messages.error).end()
						.find('.syncNote').show().end()
						.find('.syncButton, .syncCancelButton').show().end()
						.show();
					this.updateSyncList();
					break;
				case "flush":
					$boxes.removeClass("pending error").addClass("success")
						.find('.syncTitle').text(statusMessage.messages.flush).end()
						.find('.syncNote').hide().end()
						.find('.syncButton, .syncCancelButton').hide().end()
						.show();
					this.updateSyncList();
					window.setTimeout(function() {
						$boxes.fadeOut();
					}, 1500);
					break;
				case "complete":
					$boxes.removeClass('pending error').addClass('success')
						.find('.syncTitle').text(statusMessage.messages.complete).end()
						.find('.syncNote').hide().end()
						.find('.syncButton, .syncCancelButton').hide().end()
						.show();
					this.updateSyncList();
					window.setTimeout(function() {
						$boxes.fadeOut();
					}, 3000);
					break;
				default:
					break;
			}
		},
		updateSyncList: function() {
			var unsynced = config.extensions.syncPlugin.getUnsynced(),
				$boxes = this.getStatusBoxes(),
				syncNote = unsynced.length ? statusMessage.messages.unsyncedNote : '',
				unsyncedList = [];
			$(unsynced).each(function() {
				unsyncedList.push("<li>"+statusMessage.getTiddlerFromURL(this)+"</li>");
			});
			unsyncedList = unsyncedList.join("\n");
			//console.log('um',unsyncedList,syncNote,unsynced);
			$boxes.find('.syncNote').text(syncNote).end()
				.find('.statusList').html(unsyncedList);
		},
		syncing: function(tiddler) {
			//console.log('statusMessage.syncing');
			this.updateStatusBox('syncing');
		},
		error: function(tiddler) {
			//console.log('statusMessage.error');
			this.updateStatusBox('error');
		},
		flush: function() {
			this.updateStatusBox('flush');
		},
		complete: function(tiddler) {
			//console.log('statusMessage.complete');
			this.updateStatusBox('complete');
		}
	};
	
	jQuery(document).ready(function() {
		config.extensions.syncPlugin = new SyncPlugin();
		var plugin = config.extensions.syncPlugin,
			sssP = config.extensions.ServerSideSavingPlugin;

		// override SSSP reporting methods so we don't show messages
		sssP.reportSuccess = function() {
			//console.log('reportSuccess',arguments);
		};
		sssP.reportFailure = function() {
			//console.log('reportFailure',arguments);
		};

		$(document).bind("syncStart", function(e, item) {
			//console.log("I am a message about starting sync!",item);
			statusMessage.syncing();
		});
		
		$(document).bind("syncFail", function(e, item, jqXHR, textStatus, errorThrown) {
			statusMessage.error();
			//console.log("I am a message about the sync failing!",item);
			if(!item) {
				return;
			}
			var tiddlerName = statusMessage.getTiddlerFromURL(item.url),
				tiddler = store.getTiddler(tiddlerName),
				error = jqXHR.status;
			if(error == 412) {
				sssP.reportFailure("saveConflict", tiddler);
			} else {
				sssP.reportFailure("saveError", tiddler);
			}
		});
		
		$(document).bind("syncSuccess", function(e, item) {
			//console.log("I am a message about the sync success!",item);
			var url = item.url,
				tiddlerName = decodeURIComponent(url.substring(url.lastIndexOf('/')+1)),
				tiddler = store.getTiddler(tiddlerName);
			// these lines taken from ServerSideSavingPlugin
			tiddler.clearChangeCount(); // cannot check for changes since save was triggered, because the context object is not passed through
			sssP.reportSuccess("saved", tiddler);
			store.setDirty(false);
			// this line taken from TiddlySpaceBackstage
			backstage.tiddlyspace.checkSyncStatus(tiddler);
		});

		$(document).bind("syncComplete", function() {
			statusMessage.complete();
			//console.log("I am a message about the sync completing!");
		});
		
		$(document).bind("syncFlush", function() {
			statusMessage.flush();
		});
		
		$('.syncButton').live('click', function() {
			plugin.sync();
			return false;
		});
		$('.syncCancelButton').live('click', function() {
			plugin.clearStorage();
			return false;
		});
				
		$.twStylesheet(store.getRecursiveTiddlerText("SyncPluginStylesheet","",10), {
			id: "SyncPluginStylesheet"
		});
	});
	
	$(document).bind('startup', function() {
		// on load, check to see if there is anything in storage
		var plugin = config.extensions.syncPlugin;
		if(plugin.nextUnsynced()) {
			$(document).trigger("syncFail");
			//plugin.sync();
		}
	});

	// hijack displayTiddler to insert the sync status box
	function insertStatusBox(elem) {
		var html = '<div class="statusBoxWrapper">' +
				'<div class="statusBox">' +
					'<strong class="syncTitle"></strong>' +
					'<p class="syncNote"></p>' +
					'<ul class="statusList"></ul>' +
					'<button class="syncButton">Sync Now</button>' +
					'<button class="syncCancelButton">Discard changes</button>' +
				'</div>' +
			'</div>';
		if(elem && !$(elem).find('.statusBox').length) {
			$(elem).find(".content").before(html);
		}
	}
	var tmp_displayTiddler = Story.prototype.displayTiddler;
	Story.prototype.displayTiddler = function(target, title) {
		tmp_displayTiddler.apply(this,arguments);
		if(title instanceof Tiddler) {
			title = title.title;
		}
		var tiddlerElem = this.getTiddler(title);
		//console.log('inserting box');
		insertStatusBox(tiddlerElem);
	};
	
	// add styles
	setStylesheet(store.getRecursiveTiddlerText("SyncPluginStylesheet","",10),"SyncPluginStylesheet");
	
}(jQuery));
/*}}}*/