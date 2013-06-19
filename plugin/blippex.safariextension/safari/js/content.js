if (window.top === window) {
   var blippex = {
      init: function() {
         this.setListeners();
         this.onLoad();
      },

      setListeners: function() {
         window.addEventListener('unload', function(event) {
            if ((event.target instanceof HTMLDocument) && (event.target.defaultView == event.target.defaultView.parent)) {
               safari.self.tab.dispatchMessage('message', {
                  'action': 'onUnload'
               });
            }
         }, true);
      },

      onLoad: function() {
         safari.self.tab.dispatchMessage('message', {
            'action': 'pageLoaded'
         });
      }
   }

   blippex.init();
}