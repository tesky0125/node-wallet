/**
* @author zh.xu
* @desc:  Wallet V6.3
*/

define(['CommonStore', 'WalletStore', 'WalletModel', 'WalletPageView', 'text!exchgphone_html', 'PayVerify', 'Util', 'Message'],
function (commonStore, WalletStore, WalletModel, WalletPageView, html, PayVerify, Util, Message) {

    var STRING = {
        PAGE_TITLE: '返现兑换手机话费',
        PROMPT_VERIFY: '充值手机{1}，充值金额￥{2}'
    };
    var exchgPhoneMsgStore = WalletStore.ExchgPhoneMsgStore.getInstance();
    var exchgPhoneModel = WalletModel.PhoneRechargeModel.getInstance();
    var userAccountModel = WalletModel.WalletAccountSearch.getInstance(); //用户信息model
    var payPhoneModel = WalletModel.ExgOrGainModel.getInstance(); 
    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        events: {
            'input .J_WalletPhoneNum': 'inputPhoneNumFn',
            'click .J_WalletRechargeList div': 'chooseRechgeAmt',
            'click .J_WalletRechargePhone': 'rechargeAmtFn'
        },
        onShow: function () {
            this.inherited(arguments);
            this.render();
            if(this.referrer=="useraccount"){
                this.els.rechargeList.html('');
                this.resetInput();
            }
            this.initCommonEvent(this.resetInput);
            this.getUserInfo();
            this.bindEvent();
            this.turning();
        },
        render: function () {
            this.$el.html(_.template(this.tpl));
            this.els = {
                rechargeBtn: this.$el.find(".J_WalletRechargePhone"), //充值
                ClearInputIcon: this.$el.find(".J_ClearInput"),
                exchgPhoneNum: this.$el.find(".J_WalletPhoneNum"), //兑换号码
                recashAmt: this.$el.find(".J_WalletRecashAmt"), //返现金额
                rechargeList: this.$el.find(".J_WalletRechargeList")
            };
        },
        bindEvent: function(){
            this.els.exchgPhoneNum.on("keyup", function (e) {
                var val = Util.formatMobileNo2($(this).val(), e);
                $(this).val(val);
                Util.setCursorTo(this, $(this).val().length);
            });
        },
        getUserInfo: function () {
            this.showLoading();
            userAccountModel.param = { reqbmp: 2 };
            userAccountModel.exec({
                suc: this._getUserInfoSuc,
                scope: this,
                fail: this.onModelExecFail
            });
        },
        _getUserInfoSuc: function (data) {
            var self = this;
            if (data.resbmp == 2) {
                var recashAmt = data.rtcash;
                this.els.recashAmt.text(recashAmt);

                this.getRechargeList();
            } else {
                this.show404(function () {
                    self.hide404();
                    self.onShow();
                });
            }
        },
        getRechargeList: function () {
            exchgPhoneModel.exec({
                suc: this._getRechargeListSuc,
                scope: this,
                fail: this.onModelExecFail
            });
        },
        _getRechargeListSuc: function (data) {
            var self = this;
            this.hideLoading();
            self.procRcCode(data, false); //404
            if (data.rc == 0) {
                if(data.mobile){
                    this.setDefaultPhone(data.mobile);
                }
                this.procDataListToshowRechargeList(data);
            }
        },
        setDefaultPhone: function(phone){
            var val = Util.formatMobileNo(phone);
            this.els.exchgPhoneNum.val(val);
            this.els.ClearInputIcon.show();
        },
        procDataListToshowRechargeList: function (data) {
            var rechargeList = [];
            var recash_amt = this.els.recashAmt.text();
            if (recash_amt) recash_amt = Number(recash_amt);

            rechargeList = Util.getSignedRechargeArr(data.mobrclist, recash_amt);
            this.showRechargeList(rechargeList);
        },
        showRechargeList: function (list) {
            var self = this;
            _.each(list || [], function (item, index) {
                if (!!item.enabled) {
                    self.els.rechargeList.append('<div class="cash_list select_black" data-rgindex="' + index + '" data-rgenabled="' + (item.enabled ? 1 : 0) + '" data-rechargamt="' + item.rechargamt + '" data-recashamt="' + item.recashamt + '"><p>' + item.rechargamt + '元<span>需 ¥' + item.recashamt + '返现</span></p></div>');
                } else {
                    self.els.rechargeList.append('<div class="cash_list select_grey" data-rgindex="' + index + '" data-rgenabled="' + (item.enabled ? 1 : 0) + '" data-rechargamt="' + item.rechargamt + '" data-recashamt="' + item.recashamt + '"><p>' + item.rechargamt + '元<span>可用返现不足</span></p></div>');
                }
            });
        },
        resetInput: function () {//重置输入框到最初形态
            this.els.exchgPhoneNum.val('');
            this.clearAllHilight();
            this.els.ClearInputIcon.hide();
        },
        validate:function(){
            var mobile = this.els.exchgPhoneNum.val().replace(/\s+/g, "");
            if (mobile != undefined) {
                var mRet = Util.verfiredMobile(mobile);
                if (mRet != true) {
                    this.showToast(Message.get(mRet));
                    this.hilightInput(this.els.exchgPhoneNum);
                    return;
                }
            }
            var selLen = this.els.rechargeList.find("div.select_orange").length;
            if(selLen === 0){
                this.showToast("请选择充值金额");
                return;
            }
            return true;
        },
        rechargeAmtFn: function () {
            var self = this;
            this.clearAllHilight();

            if (this.validate()) {
                this.chosenPayWay();
            }
        },
        chosenPayWay: function () {
            var self = this;
            var _phone = this.getPhoneNum();
            var _amount = this.getRechargeAmt();

            var prompt = Util.formatStr(STRING.PROMPT_VERIFY, _phone, _amount);
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
                    self.payPhoneByRecash(param);
                },
                failure: function () {
                },
                cancel: function () {
                },
                showAlert: function (type) {
                    //this.bIgnoreBackKey = true; 只有在页面开始时就弹框的才设置.
                }
            }, '', { payPsdPrompt: prompt,fingerPrompt: prompt});
        },
        payPhoneByRecash: function (params) {//paying phone function
            var self = this;
            this.showLoading();
            payPhoneModel.param = {
                waytype: 6,
                amount: self.getRechargeAmt(),
                mobile: self.getPhoneNum()
            };
            for (var per in params) {
                payPhoneModel.param[per] = params[per];
            }
            payPhoneModel.exec({
                suc: self._payPhoneFn,
                scope: this,
                fail: function (data) {
                    self.onModelExecFailAsync(data);
                },
                abort: function () {
                }
            });
        },
        _payPhoneFn: function (data) {//success of paying phone
            this.hideLoading();
            this.procRcCode(data, true, true);

            //1404011   充值请求已提交，携程正在处理中，请稍后查看结果---该用户是中风险需要人工验证
            //1404013   返现账户异常，请联系携程客服---用户高风险
            if (data.rc == 0 || data.rc == 1404011) {
                this.setExgPhoneResultInfo(data);
                this.forward('result?path=exchgphone&issuc=0&amt=' + this.getRequiredRecashAmt() + '&realamt=' + this.getRechargeAmt());
            } else if (data.rc == 1404013 || data.rc == 1404012) {//1404012 :后台返回错误；1404013:用户高风险
                this.setExgPhoneResultInfo(data);
                this.forward('result?path=exchgphone&issuc=1&amt=' + this.getRequiredRecashAmt() + '&realamt=' + this.getRechargeAmt());
            } else {
                this.showToast(data.rmsg || "网络系统异常，请稍后再试");
            }
        },
        setExgPhoneResultInfo: function (data) {//set info before jump the other page
            var phoneWithSpace = this.getPhoneNum();
            phoneWithSpace = phoneWithSpace.replace(/(\d{3})(\d{4})(\d{4})/gi, "$1 $2 $3");
            console.log(phoneWithSpace);
            exchgPhoneMsgStore.setAttr("phone", encodeURIComponent(phoneWithSpace));
            exchgPhoneMsgStore.setAttr("msg", data.rmsg || "充值请求已提交运营商，请稍后查看结果");
        },
        getRechargeAmt: function () {
            var money = "";
            money = this.els.rechargeList.find("div.select_orange").attr('data-rechargamt'), money = money.trim();
            return money;
        },
        getRequiredRecashAmt: function () {
            var amt = "";
            amt = this.els.rechargeList.find("div.select_orange").attr('data-recashamt'), amt = amt.trim();
            return amt;
        },
        getPhoneNum: function () {
            var str = this.els.exchgPhoneNum.val().replace(/\s+/g, "");
            return str.trim();
        },
        inputPhoneNumFn: function (e) {
            var val = $(e.target).val();
            if (val != '') {
                this.els.ClearInputIcon.show();
            } else {
                this.els.ClearInputIcon.hide();
            }
        },
        chooseRechgeAmt: function (e) {
            var ele = $(e.currentTarget);
            if (ele.attr("data-rgenabled") == "1") {
                this.clearAllSelected();
                ele.removeClass("select_black").addClass("select_orange");
            }
        },
        clearAllSelected: function(){
            $(".J_WalletRechargeList div").each(function (i, item) {
                if ($(item).attr("data-rgenabled") == "1") {
                    $(item).removeClass("select_orange").addClass("select_black");
                }
            });
        },
        clearAllHilight: function () {
            var self = this;
            this.clearHilight(self.els.exchgPhoneNum);
        },
        hilightInput: function (ele) {//显示高亮
            ele.parents('li').addClass('bgc1');
        },
        clearHilight: function (ele) {
            ele.parents('li').removeClass('bgc1');
        }
    });

    return View;
});

