/**
 * @author wxm
 * @desc:  Wallet V6.10
 */

define(['cGuiderService', 'text!readme_html', 'Util', 'Log', 'WalletPageView', 'WalletModel', 'Config', 'Message', 'ModelObserver'],
    function(cGuiderService, html, Util, Log, WalletPageView, WalletModel, Config, Message, ModelObserver) {

        var STRING = {
            PAGE_TITLE: '携程钱包使用说明'
        };

        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            onCreate: function() {
                this.inherited(arguments);

                this.render();
                this.turning();
            },
            render: function() {
                this.$el.html(_.template(this.tpl));
            },
            onShow: function() {
                this.inherited(arguments);
            },
            returnHandler: function() {
                if (!Config.IS_INAPP) {
                    history.back();
                } else {
                    if (history.length > 1) {//TODO: test initial length by ios and android
                        //this page is not the first page and can go back
                        history.back();
                    } else {
                        //new webview in app, just close my webview to exit
                        cGuiderService.backToLastPage();
                    }
                }
            }
        });

        return View;
    });