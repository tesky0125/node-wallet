/**
* @author wxm
* @desc:  Wallet V5.9
*/

define(['Log', 'Util', 'WalletPageView', 'WalletModel', 'WalletStore', 'Message', 'text!rechargedetail_html'],
function (Log, Util, WalletPageView, WalletModel, WalletStore, Message, html) {

    var STRING = {
        PAGE_TITLE: "充值记录详情"
    };

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        homeBtn: false,
        //backToPage: 'rechargelist',
        onCreate: function () {
            this.inherited(arguments);
            this.$el.html('');
        },
        events: {
            'click .J_Question': function () {
                this.getCstMsg().showMessage(Message.get(115));
            }
        },
        onShow: function () {
            this.inherited(arguments);

            var detailStore = WalletStore.RechargeDetailStore.getInstance();
            this.model = detailStore.get();

            this.render();
            this.turning();
        },
        render: function () {
            this.$el.html(_.template(this.tpl, this.model));
        }
    });

    return View;
});
