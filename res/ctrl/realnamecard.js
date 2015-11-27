/**
* @module bindcardaddcredit
* @author luzx
* @description add credit card.
* @version since Wallet V6.2
*/
define(['WalletModel', 'WalletStore', 'Util', 'WalletBindCardService', 'Message', 'cUtilCryptBase64', 'RealName', 'Config'],
function (WalletModel, WalletStore, Util, WalletBindCardService, Message, cUtilCryptBase64, RealName, Config) {

    var realNameCardStore = WalletStore.RealNameCardStore.getInstance();
    var exports = WalletBindCardService.extend({
        bindcardtype:'realname',
        paymchid:Config.PAYMCHIDS.REALNAME,
        dataStore:realNameCardStore,
        title: '验证银行卡信息',
        backBtn: true,
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);

            var info = this.dataStore.get();//stored in addcard
            this.elements.cardInfo = info.card;
            this.elements.fieldlist = info.card.fieldlist;
            this.elements.authoptstatus = info.card.AuthOptStatus;
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
                    that.confirmRealName(function () {
                        that.submit();
                    });
                }
            })
        },
        submitSuccess:function(data){
            this.forward('validatepremobile?path=realname');
        },
        changeCardHandler: function () {
            this.back('accountverified');
        }
    });

    return exports;
});