blippex.define('blippex.core', {
	tabs: {},
	_tabs: {}, /* just to get tab id for safari */
	init: function() {
		blippex.core.addListeners();
		blippex.libs.timespent.init();
	},
	
	getTabId: function(tab){
		var tabId = null;
		for (var i=0; i<safari.application.activeBrowserWindow.tabs.length;i++){
			if (safari.application.activeBrowserWindow.tabs[i] == tab){
				tab = safari.application.activeBrowserWindow.tabs[i];
			}
		}
		for (var _tabId in blippex.core._tabs){
			if (blippex.core._tabs[_tabId] == tab){
				tabId = _tabId;
			}
		}
		tabId = tabId || ((new Date().getTime()) + Math.round(Math.random()*1000));
		blippex.core._tabs[tabId] = tab;
		return tabId;
	},
	
	addListeners: function() {
		safari.application.addEventListener("message", function(messageEvent){
			switch (messageEvent.message.action){
				case "pageLoaded":
					if (!(safari.application.privateBrowsing || {'enabled': false}).enabled){
							blippex.core.onLoad({
								'tab':	messageEvent.target
							})
					}
					break;
				case 'onUnload':
					blippex.core.onUnload({
						'tab':	messageEvent.target
					})
				}
			}
		);
		
		//safari.application.addEventListener("close", function(e){
		//	blippex.core._tabHandlerEvent(e);
		//}, true);
		//safari.application.addEventListener("beforeNavigate", function(e){
		//	blippex.core._tabHandlerEvent(e);
		//}, true);
		
//    chrome.tabs.onRemoved.addListener(function(tabId){
//			blippex.libs.timespent.upload({
//				'tabId':	tabId
//			});
//			blippex.core.tabs[tabId] = blippex.config.status.uploaded;
//    });
	},
	
	_tabHandlerEvent: function(e){
		if (e.target){
			blippex.browser.debug.log('onClose/beforeNavigate event fired, detecting tab ID....');
			var tabId = blippex.core.getTabId(e.target);
			if (tabId){
				blippex.browser.debug.log('unloading tab with id: ' + tabId);
				if (blippex.core.tabs[tabId] && archify.core.TABS[tabId].header && archify.core._TAB_IDS[tabId]){
					window.setTimeout(function(){
						archify.core._sendTime({
							'tabId': tabId,
							'tab':	 e.target
						});
						archify.api.time.remove({'tabId': tabId});
						delete archify.core._TAB_IDS[tabId];
					}, 3000) //delayed sending since tab ID is unique per session and there should be possible close of the browser, thus data will be not sent correctly
				}
			}
		}
	},
	
	onLoad: function(oArgs){
		blippex.libs.timespent.upload({
			'tabId':	blippex.core.getTabId(oArgs.tab)
		});
		blippex.core.tabs[blippex.core.getTabId(oArgs.tab)] = {
			'status':			blippex.browser.tabs.check({'url':	oArgs.tab.url}),
			'timespent':	0,
			'timestamp':	blippex.libs.misc.formatDate(),
			'url':				oArgs.tab.url
		}
	},
	
	onUnload: function(oArgs){
		blippex.libs.timespent.upload({
			'tabId':	blippex.core.getTabId(oArgs.tab)
		});
		blippex.core.tabs[blippex.core.getTabId(oArgs.tab)] = blippex.config.status.uploaded;
		
	}
});