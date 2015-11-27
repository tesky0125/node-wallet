/**
* @module bindcardaddcredit
* @author luzx
* @description add credit card.
* @version since Wallet V6.2
*/
define(['WalletModel', 'WalletStore', 'Util', 'WalletBindCardService', 'Message', 'cUtilCryptBase64', 'RealName', 'Config'],
function (WalletModel, WalletStore, Util, WalletBindCardService, Message, cUtilCryptBase64, RealName, Config) {

    var bindCardStore = WalletStore.BindCardStore.getInstance();
    var exports = WalletBindCardService.extend({
        bindcardtype:'bindcard',
        paymchid:Config.PAYMCHIDS.BINDCARD,
        dataStore:bindCardStore,
        title: '验证银行卡信息',
        backBtn: true,
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);
            var that = this;

            var info = this.dataStore.get();//stored in addcard
            this.elements.cardInfo = info.card;
            this.elements.fieldlist = info.card.fieldlist;
            this.elements.authoptstatus = info.card.AuthOptStatus;//0/1

            this.loadCerList(this.render);
        },
        render: function () {
            this.inherited(arguments);
            this.addInputCardInfoTip();
            this.bindEvent();
            this.turning();
        },
        bindEvent: function () {
            var that = this;
            this.$el.find('.J_Next').on('click', function () {
                if (that.validate()) {
                    that.submit();
                }
            })
        },
        submitSuccess:function(data){
            this.forward('validatepremobile?path=bindcard');
        },
        changeCardHandler: function () {
            this.back('mybankcard');
        }
    });

    return exports;
});
