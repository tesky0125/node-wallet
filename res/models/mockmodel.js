/**
* @module mockmodel
* @author wxm
* @description load mock data from mockdata.js
*/


define(['WalletModel', 'WalletStore', 'Config'],
    function (WalletModel, WalletStore, Config) {

        if (Config.DEBUG) {
            var debugOptStore = WalletStore.DebugOptStore.getInstance();
            var opt = debugOptStore.get();

            if (opt) {
                Config.MOCK_SERVICE_CALL = opt.usemock;
            }
        }

        function _loadMockDataJS( id, fileUrl, model ) {
            var scriptTag = document.getElementById( id );
            var oHead = document.getElementsByTagName('HEAD').item(0);
            var oScript= document.createElement("script");
            if ( scriptTag ) oHead.removeChild( scriptTag );
                oScript.id = id;
                oScript.type = "text/javascript";
                oScript.src = fileUrl;
                oScript.onload = _.bind(function () {
                    for (cls in this) {
                        if (this[cls] && typeof (this[cls]) == 'function' && window.walletMockData[cls]) {
                            this[cls].prototype.getData = window.walletMockData[cls];
                        }
                    }
                }, model);

                oHead.appendChild(oScript);
        }

        if (Config.MOCK_SERVICE_CALL) {
            //if (Config.IS_INAPP) {
            //    _loadMockDataJS(112233, "mockdata.js", WalletModel);
            //} else {
            //    _loadMockDataJS(112233, "res/models/mockdata.js", WalletModel);
            //}

            if (location.href.match(/^http/i)) {
                _loadMockDataJS(112233, "res/models/mockdata.js", WalletModel);
            } else {
                _loadMockDataJS(112233, "mockdata.js", WalletModel);
            }
        }
        return null;
});