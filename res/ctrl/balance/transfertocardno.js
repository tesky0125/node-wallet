/**
* @author wwg
* @desc:  Wallet V6.1
*/

define(['CommonStore', 'WalletStore', 'WalletModel', 'WalletPageView', 'text!transfertocardno_html', 'Util', 'cUtilCryptBase64', 'Message'],
function (commonStore, WalletStore, WalletModel, WalletPageView, html, Util, cUtilCryptBase64, Message) {

    var STRING = {
        PAGE_TITLE: '转出到储蓄卡'
    };

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        //backToPage: 'useraccount',
        events: {
            'click .J_Next': 'goNext'
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);
            this.render();
            this.bindEvent();
            this.initCommonEvent();
            this.turning();
        },
        render: function () {
            this.$el.html(_.template(this.tpl));
            this.els = {
                bankcard: this.$el.find(".J_Bankcard")
            };
        },
        bindEvent: function () {
            var that = this;
            this.els.bankcard.on("keyup", function (e) {
                var val = Util.formatCardCode2($(this).val(), e);
                $(this).val(val);
                Util.setCursorTo(this, $(this).val().length);
            });
        },
        resetInput: function () {
            this.els.bankcard.parents("li").removeClass("cui-input-error");
        },
        invalidInput: function () {
            this.els.bankcard.parents("li").addClass("cui-input-error");
        },
        goNext: function () {
            this.resetInput();

            var cardno = this.getCard().replace(/\s+/g, '');
            if (cardno == '') {
                this.invalidInput();
                this.showToast(Message.get(331));
                return;
            }

            if (cardno.length < 10 || !/^\d+$/.test(cardno)) {
                this.invalidInput();
                this.showToast(Message.get(329));
                return;
            }
            var checkModel = WalletModel.CheckBin.getInstance();
            var checkBinStore = WalletStore.CheckBin.getInstance();
            this.loading.show();

            checkBinStore.remove();

            checkBinStore.setBase64("cardno", cardno);

            checkModel.param.cardno = cUtilCryptBase64.Base64.encode(cardno);
            checkModel.param.chktype = 1;
            checkModel.exec({
                scope: this,
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data, true);
                    if (data.rc == 0) {

                        if (data.unionSavingCard.length == 0 && (data.creditCard.length > 0 || data.unionCreditCard.length > 0)) {
                            //creditCard 直连信用卡 unionCreditCard 银联信用卡 非储蓄卡.
                            this.showToast(Message.get(356));
                        } else {
                            this.forward('transfertocard');
                        }
                    } else {
                        this.invalidInput();
                    }
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data, 330);
                }

            })
        },
        getCard: function () {
            return this.els.bankcard.val().replace(/\s+/g, '');
        },
        onHide: function () {
            this.inherited(arguments);
            this.els.bankcard.val('');
        }
    });

    return View;
});

