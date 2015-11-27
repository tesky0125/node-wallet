/**
* @author wwg
* @desc:  Wallet V6.1
*/

define(['IdCodePageView', 'WalletModel', 'WalletStore', 'text!phonevalidate_html', 'Util', 'Message', 'Config'],
function (IdCodePageView, WalletModel, WalletStore, html, Util, Message, Config) {

    var STRING = {
        PAGE_TITLE: '手机验证'
    };

    var transDepositCardModel = WalletModel.ExgOrGainModel.getInstance();
    var userModel = WalletModel.WalletUserInfoSearch.getInstance();

    var transfer2Store = WalletStore.Transfer2Store.getInstance();

    var userInfoStore = WalletStore.UserInfoStore.getInstance();

    var View = IdCodePageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        requestCode: 65, //返现转出到储蓄卡补充验证.
        backBtn: true,
        //backToPage: 'transfertocard',
        getIdCodeFailGoto: 'transfertocard',
        events: {
            'click .J_Get-indentify-code': 'getIdentifyCode',
            'click .J_Next': 'checkMobile'
        },
        onCreate: function () {
            this.inherited(arguments);
            this.render();
            this.bindIDCodeEvent();
        },
        onShow: function () {
            this.inherited(arguments);

            this.params = transfer2Store.getAttr('params');

            if (this.params == null) {
                this.back("transfertocard");
                return;
            }

            this.secmobile = "";
            if (userInfoStore.hasPwdData()) {
                var _userInfo = userInfoStore.get();
                this.secmobile = _userInfo.mobile;
                this._setSecMobile();
            } else {
                this._getUserInfo();
            }


            this.turning();
        },
        _getUserInfo: function () {
            this.loading.show();
            userModel.param = {};
            userModel.param.reqbmp = 2; //密码信息.
            userModel.exec({
                suc: function (info) {
                    this.loading.hide();
                    if (info.rc == 0) {
                        this.secmobile = info.mobile;
                        this._setSecMobile();
                    } else {
                        this.procRcCode(info);
                    }
                },
                fail: this.onModelExecFail,
                scope: this
            });
        },
        _setSecMobile: function () {
            if (this.secmobile == '') {
                this.back("transfertocard");
                return;
            }

            var $mobile = this.$el.find('.J_SecMobile');

            $mobile.val(this.secmobile);

            this.getIdentifyCode();
        },
        render: function () {
            var that=this;
            this.$el.html(this.tpl);
            setTimeout(function () {
                that.existIntervalStore();
            }, 100);
        },
        checkMobile: function () {
            var that = this;
            var f = this.checkInfo();
            if (!f) {
                return;
            }
            if(!Config.VERIFY_ID_CODE) {
                this.loading.show();
                this.manualVerfiedIdentifyCode(this.$el.find('.J_Indentify'), function(ret){
                    that.loading.hide();
                    if(ret) {
                        that.goNext();
                    }
                });
            }else{
                this.goNext();
            }
        },
        goNext:function(){
            var that = this;
            var vercode = this.$el.find('.J_Indentify').val();
            this.params.vercode = vercode;
            this.showLoading();
            transDepositCardModel.setParam(this.params);
            transDepositCardModel.exec({
                scope: this,
                suc: function (ret) {
                    transfer2Store.remove();

                    this.hideLoading();

                    if (ret.rc == 0) {
                        //成功
                        ret.status = 1; //status for result page judge. 1:success 2:fail 3:processing
                    } else if (ret.rc == 1404004) {
                        //处理中..
                        ret.status = 3;
                    } else {
                        //失败 其他错误
                        ret.status = 2;
                    }

                    ret.amount = this.params.amount;
                    ret.bankname = this.params.bankname;

                    transfer2Store.setObject(ret);
                    this.forward("result?path=transfer");

                },
                fail: function () {
                    this.onModelExecFailAsync(data, 330);
                }
            });
        }
    });

    return View;
});