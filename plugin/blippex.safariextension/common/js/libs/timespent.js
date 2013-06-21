/*
 ** @version 1.0
 ** Used to calculate the time user is spending to view active tab
 */
blippex.define('blippex.libs.timespent', {
	interval: 1000,
	cache: {},
	timer: null,
	isActive: true,
	init: function(){
		blippex.libs.timespent.restoreSession();
		blippex.libs.timespent.timer = window.setInterval(function(){
			blippex.libs.timespent.capture();
		}, blippex.libs.timespent.interval);
		window.addEventListener("focus", function () {
			blippex.libs.timespent.isActive = true;
		}, false);
		window.addEventListener("blur", function () {
			blippex.libs.timespent.isActive = false;
		}, false);
	},
	
	capture: function(){
		var tabId = blippex.core.getTabId(safari.application.activeBrowserWindow.activeTab);
		if (tabId && blippex.core.tabs[tabId] && blippex.libs.timespent.isActive && blippex.libs.disabled.isEnabled()){
			blippex.core.tabs[tabId].timespent++;
			var value = '%s|%s|%s'.replace('%s', blippex.core.tabs[tabId].timestamp)
														.replace('%s', blippex.core.tabs[tabId].url)
														.replace('%s', blippex.core.tabs[tabId].timespent)
			blippex.libs.timespent.update({'tabId': tabId, 'value': value});
		}
	},
	
	upload: function(oArgs){
		var tabId = oArgs.tabId;
		if (blippex.core.tabs[tabId]
				&& blippex.core.tabs[tabId].status == blippex.config.status.ok
				&& blippex.core.tabs[tabId].timespent > blippex.config.values.timeout
				&& blippex.libs.disabled.isEnabled()){
					blippex.browser.debug.log('sending time %s sec. for %s'.replace('%s',blippex.core.tabs[tabId].timespent).replace('%s',blippex.core.tabs[tabId].url))
					blippex.api.upload.sendTime({
						'timestamp':	blippex.core.tabs[tabId].timestamp,
						'url':				blippex.core.tabs[tabId].url,
						'timespent':	blippex.core.tabs[tabId].timespent
					});
		}
		blippex.libs.timespent.remove(oArgs);
	},
	
	remove: function(oArgs){
		delete blippex.libs.timespent.cache[(oArgs.tabId + '_ts')];
		blippex.browser.settings.set('timespentvalues', blippex.libs.timespent.cache);
	},
	
	update: function(oArgs){
		blippex.libs.timespent.cache[oArgs.tabId + '_ts'] = oArgs.value;
		blippex.browser.settings.set('timespentvalues', blippex.libs.timespent.cache);
	},
	
	restoreSession: function(){
		var localCache = blippex.browser.settings.get('timespentvalues');
		blippex.browser.settings.set('timespentvalues', '');
		if (blippex.libs.disabled.isEnabled()) {
			for (var key in localCache){
				if (/_ts$/i.test(key)){
					var aItem = (localCache[key]+'').split('|');
					if (aItem.length > 1 && aItem[2] > blippex.config.values.timeout){
						blippex.api.upload.sendTime({
							'timestamp':	aItem[0],
							'url':				aItem[1],
							'timespent':	aItem[2]
						});
					}
				}
			}
		}
	}
});
