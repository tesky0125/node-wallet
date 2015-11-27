/**
* @module walletinputpageview
* @author wxm
* @description wallet input money page view, for pages with similar request like recharge
* @version since Wallet V5.10
*/

define(['Log', 'Util', 'WalletPageView', 'WalletModel', 'WalletStore', 'Message', 'Config', 'text!inputmoney_html'],
function (Log, Util, WalletPageView, WalletModel, WalletStore, Message, Config, html) {

    var STRING = {
        PAGE_TITLE: "输入充值金额"
    };

    var View = WalletPageView.extend({
        tpl: html,
        backBtn: true,
        homeBtn: false,
        events: {
            'click .J_NextBtn': 'onClickNext'
        },
        resetInput: function () {
            this.$money.val('');
            this.$money.parents('li').removeClass('bgc1');
            //this.$next.addClass('gray');
            this.$el.find('.J_ClearInput').hide();
        },
        hilightInput: function () {
            this.$money.parents('li').addClass('bgc1');
        },
        getTplStr: function () /*abstract function*/{
            Log.Error('assert fail, please override this api');
        },
        ERR_PLS_INUPT: 0,
        ERR_INUPT_FMT: 1,
        ERR_OVER_MAX: 2,
        getErrStr: function (type) /*abstract function*/ {
            Log.Error('assert fail, please override this api');
        },
        onCreate: function () {
            this.inherited(arguments);
            this.render();
            this.initCommonEvent(this.resetInput);

            var that = this;
            this.$money.on('blur', _.bind(function (e) {
                var val = this.$money.val();
                this.$money.val(Util.parseMoney(val));
                if (!this.$money.val()) {
                    this.$el.find('.J_ClearInput').hide();
                    //this.$next.addClass('gray');

                    if (val) {
                        this.showToast(this.getErrStr(this.ERR_PLS_INUPT));
                    }
                }
            }, this));
            /*
            this.$money.bind('input', function () {
                var val = $(this).val();

                if (val != '') {
                    that.$next.removeClass('gray');
                } else {
                    that.$next.addClass('gray');
                }
                
            })
            */
        },
        onShow: function () {
            this.inherited(arguments);

            this.resetInput();
            this.turning();
        },
        onHide: function () {
            this.inherited(arguments);
            this.resetInput();
        },
        render: function () {
            this.$el.html(_.template(this.tpl, this.getTplStr()));
            this.$money = this.$el.find('.J_Money');
            this.$next = this.$el.find('.J_NextBtn');
        },
        onClickNext: function () {
            var val = this.$money.val();

            if (!Util.passCheckZeroMoney(val)) {
                this.hilightInput();
                this.$money.val('');
                this.showToast(this.getErrStr(this.ERR_PLS_INUPT));
                return '';
            }

            if (!Util.passCheckMoney(val)) {
                this.hilightInput();
                this.showToast(this.getErrStr(this.ERR_INUPT_FMT));
                return '';
            }

            if (this.maxInput && parseFloat(val) > this.maxInput) {
                this.hilightInput();
                this.showToast(this.getErrStr(this.ERR_OVER_MAX));
                return '';
            }

            return val;
        }
    });

    return View;
});
