/**
 * @module loading
 * @author wxm
 * @description wrap up of loading layer
 * @version since Wallet V5.8
 */

define(['Config', 'WalletLoading'], function(Config, WalletLoading) {
    var State = 'showing';
    return {
        show: function() {
            State = 'showing';
            setTimeout(function() {
                if (State == 'showing') {
                    //if (Config.IS_INAPP) { //
                        WalletLoading.show();
                    //} else {
                    //    Lizard.showLoading();
                    //}
                }
            }, 0);
        },
        hide: function() {
            State = 'closing';
            setTimeout(function() {
                if (State == 'closing') {
                    //if (Config.IS_INAPP) { //
                        WalletLoading.hide();
                    //} else {
                    //    Lizard.hideLoading();
                    //}
                }
            }, 150);
        }
    }
});