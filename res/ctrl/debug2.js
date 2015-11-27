/**
 * @author wxm
 * @desc:  Wallet V5.7
 */

define(['WalletStore', 'WalletPageView', 'Config', 'text!debug2_html', 'cUtilCryptBase64', 'AdPlugin'],
    function(WalletStore, WalletPageView, Config, html, cUtilCryptBase64, AdPlugin) {

        var STRING = {
            PAGE_TITLE: "XXXX"
        };

        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            homeBtn: false,
            backToPage: 'index',
            onCreate: function() {
                this.inherited(arguments);
                this.render();
            },
            onShow: function() {
                this.inherited(arguments);
                this.turning();
            },
            render: function() {
                this.$el.html(_.template(this.tpl, this.model));

                var ani = ((new Date()).getSeconds() % 2)  === 0;
                var trans = ((new Date()).getSeconds() % 10)  > 5;
                this.adPlugIn = new AdPlugin({
                    selector: '.J_Bill',
                    tpl: '<div class="mt15 J_Bill" style="height:0px"></div>',
                    view: this,
                    ver: Config.CVER_HEAD_Hybrid,
                    animate: ani,
                    translate: trans
                });
                $('.J_D').html('Animate: ' + ani + ';  Translate: ' + trans);
                this.adPlugIn.render();
            }
        });

        return View;
    });