/*
 **	@class blippexPopup
 ** @version 1.0
 */
var background = safari.extension.globalPage.contentWindow;
var _blippex = background.blippex;

blippex.define('blippex.popup', {
	_init: function() {
		blippex.popup.initHandlers();
		blippex.popup.popupRenderer();
	},
	initHandlers: function(){
		blippex.popup.addEventListener('blippex-input-value', function(event){if (event.keyCode == 13) {blippex.popup.onSearch();}return false;}, 'keydown');
		blippex.popup.addEventListener('blippex-input-enable', function(){blippex.popup.onEnable();return false;});
		blippex.popup.addEventListener('blippex-input-submit', function(){blippex.popup.onSearch();return false;});
		blippex.popup.addEventListener('blippex-checkbox-nohttps', function(){blippex.popup.onHttps(this.checked)});
	},
	addEventListener: function(id, handler, event){
    event = event || 'click';
		document.getElementById(id).parentNode.replaceChild(document.getElementById(id).cloneNode(true), document.getElementById(id));
		document.getElementById(id).addEventListener(event, handler, false);
	},
	popupRenderer: function(){
		document.getElementById('blippex-checkbox-nohttps').checked = _blippex.browser.settings.get('nohttps', true);
		document.getElementById('blippex-input-enable').innerText = _blippex.libs.disabled.isEnabled() ? "Deactivate for 30min" : "Reactivate"
		blippex.popup.onFit();
	},
	onEnable: function(){
		_blippex.libs.disabled.toggle();
		blippex.popup.onHide();
	},
	onHttps: function(skip){
		_blippex.browser.settings.set('nohttps', skip);
	},
	onSearch: function(){
		var _query = document.getElementById('blippex-input-value');
		if (_query && _query.value.length){
			_blippex.browser.tabs.add('https://www.blippex.org/?q='+encodeURIComponent(_query.value));
			_query.value = "";
			blippex.popup.onHide();
		}
	},
	onHide: function(id){
		safari.extension.popovers[0].hide();
	},
	onFit: function(){
    var pPopover = safari.extension.popovers[0];
    pPopover.height = pPopover.contentWindow.document.getElementById('popup').scrollHeight;
		pPopover.width = 450;		
  },
});



safari.application.addEventListener("popover", function(){
	try{Typekit.load();}catch(e){}
	blippex.popup._init();
}, true);
