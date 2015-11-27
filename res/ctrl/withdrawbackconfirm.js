/**
* @author wxm
* @desc:  Wallet V5.7
*/

define(['Log', 'Util', 'WalletPageView', 'WalletModel', 'WalletStore', 'text!withdrawbackconfirm_html', 'Tradelist','PayVerify'],
function (Log, Util, WalletPageView, WalletModel, WalletStore, html, Tradelist,PayVerify) {

    var STRING = {
        PAGE_TITLE: "确认提现账户和金额",
        PAYPSD_VERIFY:'请输入携程支付密码，以完成提现',
        FINGER_VERIFY:'请验证您的指纹，以完成提现',
    };

    var WithDrawBackStore = WalletStore.WithDrawBack.getInstance();
    var fixedModel = WalletModel.SubmitFixed.getInstance();


    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        events: {
            'click .J_Confirm': 'confirmWithdrawBack'
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);

            var store = WalletStore.QuerySource.getInstance();
            var data = store.get();

            var amount = WithDrawBackStore.getAttr('amount');
            amount = Util.parseMoneyZeroFill(amount);
            var vm = {
                int: amount.split(".")[0],
                decimal: amount.split(".")[1],
                multiple: data.srclist.length
            };

            this.$el.html(_.template(html, vm));

            var detailDiv = this.$el.find('.J_Detail');
            Tradelist.setData(data.srclist);
            var template = Tradelist.getTemplate();
            detailDiv.html(template);

            this.turning();
        },
        confirmWithdrawBack: function (){
            var that = this;
            PayVerify.exec(this, {
                success: function (data) {
                    var param = {};
                    if (data.verifytype == 1) {//validate password
                        param.paypwd = data.pwd;
                    } else {//validate fingerprint
                        var _touchInfo = {
                            requestid: data.requestid,
                            keytoken: data.paytoken,
                            keyguid: data.keyguid,
                            devguid: data.devguid
                        };

                        param.touchinfo = _touchInfo;

                    }
                    that.payWithDraw(param);
                },
                failure: function () {

                },
                cancel: function () {
                }
            }, '', { payPsdPrompt: STRING.PAYPSD_VERIFY,
                fingerPrompt:STRING.FINGER_VERIFY
            });
        },
        payWithDraw:function(params){
            var that = this;
            this.loading.show();
            fixedModel.param = {
                cur: 1,
                amount: WithDrawBackStore.getAttr('amount')
            };
            for (var per in params) {
                fixedModel.param[per] = params[per];
            }
            fixedModel.exec({
                suc: function(info) {
                    that.loading.hide();
                    that.procRcCode(info, true, true);
                    //if (info.rc == 0) {
                    that.forward("result?path=withdrawback");
                    //}
                },
                fail: function(data) {
                    that.onModelExecFailAsync(data, 330);
                },
                scope: this
            })
        }
    });

    return View;
});
