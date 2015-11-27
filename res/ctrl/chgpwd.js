/**
* @author wxm
* @desc:  Wallet V5.7
*/

define(['Util', 'Log', 'WalletPageView', 'WalletModel', 'Config', 'Message'],
    function (Util, Log, WalletPageView, WalletModel, Config, Message) {

    var STRING = {
        PAGE_TITLE: '设置支付密码',
        PSD_ALERT_TITLE: '无法设置支付密码，请联系携程客服以完成相关操作。',
        CANCEL: '取消',
        CONTACT_SERVICE: '联系客服'
    };

    var userInfoSearchModel = WalletModel.WalletUserInfoSearch.getInstance();

    var View = WalletPageView.extend({
        redirect:true,//This is a transitional page, not show in view, just redirect to next page!
        //tpl: html,
        //title: STRING.PAGE_TITLE,
        //backBtn: true,
        //homeBtn: false,
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);

            if (!Util.checkUser(this))
                return;

            this.loading.show();
            userInfoSearchModel.param = {};
            userInfoSearchModel.param.reqbmp = 0; //all;
            userInfoSearchModel.exec({
                suc: this._getactinfo_suc,
                fail: function () {
                    var that = this;
                    this.loading.hide();
                    this.showToast(Message.get(330), function () {
                        that.returnHandler();//returnHandlerChgPwd
                    });
                },
                scope: this
            });
        },
        _getactinfo_suc: function (data) {

            var that = this;

            if (data.rc != 0) {
                this.loading.hide();
                this.showToast(data.rmsg, function () {
                    that.returnHandler();//returnHandlerChgPwd
                });
            } else {
                if (data.haspwd && !data.secmobile && !data.secemail) {
                    this.loading.hide();
                    this.showDlg({
                        message: STRING.PSD_ALERT_TITLE,
                        buttons: [{
                            text: STRING.CANCEL,
                            click: function () {
                                that.returnHandler();//returnHandlerChgPwd
                                this.hide();
                            }
                        }, {
                            text: STRING.CONTACT_SERVICE,
                            click: function () {
                                this.hide();
                                Util.callPhone(Config.SERVICE_TEL_NUMBER);
                                that.returnHandler();//returnHandlerChgPwd
                            }
                        }]
                    });
                    this.bIgnoreBackKey = true;
                } else {
                    if (data.haspwd) {
                        this.loading.hide();
                        this.forward('resetpaypsd');
                        // this.forwardWithToken('resetpaypsd', true); //will jump to new url
                    } else {
                        this.forward('setpaypsd2');
                        // this.forwardWithToken('setpaypsd2', true);
                    }
                }
            }
        }
    });

    return View;
});
