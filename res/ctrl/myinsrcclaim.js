/**
 * @author yjj
 * @desc:  Wallet V6.10
 */
define(['text!myinsrcclaim_html', 'WalletPageView','WalletStore','Util'],
    function ( html, WalletPageView, WalletStore, Util) {
        var STRING = {
            PAGE_TITLE: '理赔'
        };

        var insrcDetailStore = WalletStore.InsrcDetailStore.getInstance();
        var View = WalletPageView.extend({
            tpl:html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            //backToPage:'myinsrcdetail',
            model:{},
            events:{
                'click .J_Insrc_Claim': function(e) {
                    var phone = $(e.currentTarget).attr('data-phone');
                    Util.callPhone(phone);
                }
            },
            onShow: function () {
                this.inherited(arguments);
                this.render();
            },
            render:function(){
                this.model = insrcDetailStore.get();
                this.$el.html(_.template(this.tpl, this.model));
                this.turning();
            }
        });

        return View;

});