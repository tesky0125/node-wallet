/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['WalletModel', 'WalletStore', 'text!howtosetfingerios_html', 'text!howtosetfingerandroid_html', 'Util', 'WalletPageView', 'Message'],
function (WalletModel, WalletStore, htmlios, htmlandroid, Util, WalletPageView, Message) {

    var STRING = {
        PAGE_TITLE: '如何设置指纹'
    };

    var touchModel = WalletModel.TouchPaySet.getInstance();
    var View = WalletPageView.extend({
        title: STRING.PAGE_TITLE,
        backBtn: true,
        //backToPage: 'securitycenter',
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);
            var that = this;

           

            this.render();
        },
        render: function () {
            var that = this;

            var html;

            if (Util.isIphone()) {
                html = htmlios;
            } else {
                html = htmlandroid;
            }

            this.$el.html(_.template(html));
            this.turning();
        }
    });

    return View;
});

