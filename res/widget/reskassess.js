/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['WalletModel', 'WalletStore', 'Util', 'Message','Config','cUtilCryptBase64','Scmg'],
function (WalletModel, WalletStore, Util, Message, Config, cUtilCryptBase64,Scmg) {

    var STRING = {
        CONFIRM: '确认',
        FORGET_PSD: '忘记密码'
    };

    var WithDrawModel = WalletModel.WithDraw.getInstance();
    var WithdrawCardStore = WalletStore.WithdrawCard.getInstance();
    var CODE = Config.RC_CODE;

    var module = {
        exec: function (context, callback) {
            var that = this;
            context.loading.show();

            WithDrawModel.param = WithdrawCardStore.get();
            if(Scmg.getV()==1){
                WithDrawModel.param.paypwd=Scmg.getP();
            }else{
                WithDrawModel.param.touchinfo=Scmg.getT();
            }
            WithDrawModel.param.cur = 1;//RMB
            WithDrawModel.param.cardholder = cUtilCryptBase64.Base64.decode(WithDrawModel.param.cardholder);

            WithDrawModel.param.rc = null;
            WithDrawModel.param.message = null;

            WithDrawModel.exec({
                suc: function (info) {
                    context.loading.hide();
                    WithdrawCardStore.setAttr("rc", info.rc);
                    WithdrawCardStore.setAttr("rfno", info.rfno);
                    WithdrawCardStore.setAttr("message", info.rmsg);
                    context.commonGoNext();
                    callback(that.getCase(context, info.rc, info.rmsg));

                },
                fail: function (data) {
                    context.onModelExecFailAsync(data, 330);
                },
                scope: context
            })
        },
        getCase: function (context, risk, msg) {
            var ret = function () { };
            switch (risk) {
                case CODE.PSD_ERROR:
                    ret = function () {
                        context.showDlg({
                            message: msg,
                            buttons: [{
                                text: STRING.CONFIRM,
                                click: function () {
                                    this.hide();
                                }
                            }, {
                                text: STRING.FORGET_PSD,
                                click: function () {
                                    this.hide();
                                    //context.forward("resetpaypsd");
                                    context.forward('resetpaypsd');
                                }
                            }]
                        });
                        context.cleanKeyboard && context.cleanKeyboard();
                    };
                    break;
                case CODE.WITHDRAW_NEED_MOBILE:
                    //need mobile
                    ret = function () {
                        //this.forward('withdrawsendcode');
                        this.forward('withdrawsendcode');
                    };
                    break;
                default:
                    ret = function () {
                        this.forward('result?path=withdraw');
                    };
                    break;
            }

            return _.bind(ret, context);
        }
    };

    return module;
});

