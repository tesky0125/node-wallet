/**
* @author wxm
* @desc:  Wallet V5.7
*/

define(['Log', 'Util', 'WalletPageView', 'WalletModel', 'WalletStore', 'Message', 'Config', 'WalletInputView'],
function (Log, Util, WalletPageView, WalletModel, WalletStore, Message, Config, WalletInputView) {

    var STRING = {
        PAGE_TITLE: "提现至原付款账户"
    };

    var View = WalletInputView.extend({
        title: STRING.PAGE_TITLE,
        //backToPage: 'transacthistory',
        //maxInput: 1000000.00,  /*abstract*/
        getTplStr: function () /*abstract function*/{
            var accountStore = WalletStore.UserAccountStore.getInstance();

            if (!accountStore.hasAccountData()) {
                this.showToast(Message.get(123), _.bind(this.returnHandler, this));
                return;
            }

            this.maxInput = accountStore.getAttr('payonly');

            return {
                tpl_explain: '可提现金额：<span><dfn>&yen;</dfn>' + accountStore.getAttr('payonly'),
                tpl_moneyname: '提现金额',
                tpl_inputtips: '输入提现金额'
            };
        },
        getErrStr: function (type) /*abstract function*/ {
            switch (type) {
                case this.ERR_PLS_INUPT:
                    return Message.get(344);
                case this.ERR_INUPT_FMT:
                    return Message.get(345);
                case this.ERR_OVER_MAX:
                    return Message.get(346);
            }
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);
        },
        onClickNext: function () {
            var val = this.inherited(arguments);

            if (val) {
                this.model = {};
                this.model.amount = val;
                this.getSrcList();
            }
        },
        getSrcList: function () {
            this.loading.show();

            var querySrcModel = WalletModel.QuerySource.getInstance();
            querySrcModel.param.cur = 1;
            querySrcModel.param.amount = this.model.amount;
            querySrcModel.exec({
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data, true);
                    if (data.rc == 0) {
                        Util.extObj(data, this.model);

                        var wbStore = WalletStore.WithDrawBack.getInstance();
                        wbStore.setAttr('amount', this.model.amount);
                        this.forward('withdrawbackconfirm');
                    }
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data, 330);
                },
                scope: this
            });
        }
    });

    return View;
});
