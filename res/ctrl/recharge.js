/**
* @author wxm
* @desc:  Wallet V5.7
*/

define(['Log', 'Util', 'WalletPageView', 'WalletModel', 'WalletStore', 'Message', 'Config', 'cGuiderService', 'cUtilCryptBase64', 'WalletInputView'],
function (Log, Util, WalletPageView, WalletModel, WalletStore, Message, Config, cGuiderService, cUtilCryptBase64, WalletInputView) {

    var STRING = {
        PAGE_TITLE: "输入充值金额"
    };

    var View = WalletInputView.extend({
        title: STRING.PAGE_TITLE,
        //backToPage: 'transacthistory',
        maxInput: 1000000.00,  /*abstract*/
        getTplStr: function () /*abstract function*/ {
            return {
                tpl_explain: '仅支持储蓄卡向账户充值',
                tpl_moneyname: '充值金额',
                tpl_inputtips: '输入充值金额'
            };
        },
        getErrStr: function (type) /*abstract function*/ {
            switch(type){
                case this.ERR_PLS_INUPT:
                    return Message.get(341);
                case this.ERR_INUPT_FMT:
                    return Message.get(342);
                case this.ERR_OVER_MAX:
                    return Message.get(340);
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
                this.getOid();
            }
        },
        getOid: function () {
            this.loading.show();

            var accnRechargeModel = WalletModel.WalletAccountRecharge.getInstance();
            accnRechargeModel.param.cur = 1;
            accnRechargeModel.param.amount = this.model.amount;
            accnRechargeModel.exec({
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data, true);
                    if (data.rc == 0) {
                        Util.extObj(data, this.model);
                        this.goPaymentPage();
                    }
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data, 330);
                },
                scope: this
            });
        },
        //http://172.16.147.1:5389/webapp/payment2/d.html#index?oid=900059161&bustype=301&token=eyJvaWQiOiI5MDAwNTkxNjEiLCJidXN0eXBlIjozMDEsImZyb20iOiJodHRwOi8vbS5mYXQ2My5xYS5udC5jdHJpcGNvcnAuY29tL3dlYmFwcC9ob3RlbC8jYm9va2luZyIsInJiYWNrIjoiaHR0cDovL20uZmF0NjMucWEubnQuY3RyaXBjb3JwLmNvbS93ZWJhcHAvaG90ZWwvI29yZGVycmVzdWx0cz90eXBlPWNuX2RvbWhvdGVsJnZhbD02OSIsInNiYWNrIjoiaHR0cDovL20uZmF0NjMucWEubnQuY3RyaXBjb3JwLmNvbS93ZWJhcHAvaG90ZWwvI29yZGVycmVzdWx0cz90eXBlPWNuX2RvbWhvdGVsJnZhbD02OSIsImViYWNrIjoiaHR0cDovL20uZmF0NjMucWEubnQuY3RyaXBjb3JwLmNvbS93ZWJhcHAvaG90ZWwvI29yZGVycmVzdWx0cz9yYz0wIiwiYXV0aCI6IkZCNUEzQTRBRkMwQzc4RTJDMDRFQ0MzMUJBMDQ2QjMxMzYyQ0RGODZBNTI1NkM0QTU4MDkwQTQ3RjgzOTExQTgiLCJ0aXRsZSI6IuS4iua1t%2Be6oualvOWuvummhiIsImN1cnJlbmN5IjoiQ05ZIiwiYW1vdW50Ijo2OSwiZGlzcGxheUN1cnJlbmN5IjoiIiwiZGlzcGxheUFtb3VudCI6IiIsImV4dG5vIjoiZWY0OTk4MzMyMzkzNDlmZDg1MzM2NTdhZWFkMzk1NjIiLCJuZWVkSW52b2ljZSI6ZmFsc2UsImludm9pY2VEZWxpdmVyeUZlZSI6MCwiaW5jbHVkZUluVG90YWxQcmljZSI6dHJ1ZSwiaXNsb2dpbiI6MCwicmVxdWVzdGlkIjoiMTAxNDA4MTExNjAwMDAwNDMxMyJ9&extend=eyJ1c2VFVHlwZSI6MSwic3ViUGF5VHlwZSI6MCwicGF5VHlwZUxpc3QiOjcsImxhc3RHdXJhbnRlZURheSI6IjIwMDEtMDEtMDEiLCJJc05lZWRQcmVBdXRoIjpmYWxzZSwiSXNOZWVkQ2FyZFJpc2siOmZhbHNlfQ%3D%3D
        //cGuiderService.cross({ path: 'lipin', param: 'index.html#account?from=wallet' });
        //this.forward('result!recharge');
        goPaymentPage: function (param) {
            var host;

            if (Config.IS_HYBRID) {//
                host = 'file://webapp/wallet/index.html#';
            } else {
                host = location.href.split('/wallet/')[0] + '/wallet/'
            }
            var sback = host + "result?path=recharge&issuc=1&rfno=" + this.model.rfno;
            var eback = host + "result?path=recharge&issuc=0&rfno=" + this.model.rfno;
            var rback = host + "recharge";
            var token = {
                oid: this.model.oid,                    //订单号
                bustype: Config.BUSTYPE_PAYMENT,        //来源
                requestid: this.model.reqid,            //支付请求ID(需全局唯一)
                islogin: 0,                             //是否会员登录 0=会员1=非会员
                from: rback,                            //跳转支付前页面的URL
                rback: rback,                           //第三方支付返回跳转URL
                sback: sback,                           //支付成功跳转URL
                eback: eback,                           //支付错误跳转URL
                //thirdback: sback,                     //第三方支付通知页面URL
                auth: Util.getAuth(),                   //登陆后服务端下发的auth
                title: '现金余额充值',                   //订单信息
                amount: parseFloat(this.model.amount)  //需要支付的金额
                //currency	                            String	需要支付的币种，默认CNY	否
                //displayCurrency	                    String	需要展示的辅币种	否
                //displayAmount	                        Decimal	需要展示的辅币金额	否
                //recall	                            String	支付平台支付成功回调	否
                //extno	                                String	LTP模式流水号	否
                //needInvoice	                        Boolean	客户是否需要发票	否
                //invoiceDeliveryFee	                Decimal	发票快递费用	否
                //includeInTotalPrice	                Boolean	订单总额是否包含发票快递费用	否
            };
            token = encodeURIComponent(cUtilCryptBase64.Base64.encode(JSON.stringify(token)));
            var param = 'index.html#index?oid=' + this.model.oid + '&bustype=' + Config.BUSTYPE_PAYMENT + '&token=' + token;
            
            if (Config.IS_INAPP) {//
                if (Config.PAY_METHOD_NATIVE) {
                    //native pay
                    cGuiderService.pay.callPay({ path: 'payment2', param: param });
                }else{
                    //web pay
                    cGuiderService.cross({ path: 'payment2', param: param });
                }
            } else {
                var path = '../payment2/';
                //var path = 'https://secure.fws.qa.nt.ctripcorp.com/webapp/payment2/';
                this.jump(path + param);
            }
        }
    });

    return View;
});
