/**
* @author zh.xu
* @desc:  Wallet V6.3
*/

define(['CommonStore', 'WalletStore', 'WalletModel', 'WalletPageView', 'text!rechargephone_html', 'Util', 'Message'],
function (commonStore, WalletStore, WalletModel, WalletPageView, html, Util, Message) {

    var STRING = {
        PAGE_TITLE: '选择充值金额'
    };
    var InfoRechargedPhoneStore = WalletStore.InfoRechargedPhoneStore.getInstance();//充值面额信息
    var userAccountStore = WalletStore.UserAccountStore.getInstance();//用户信息store
    var userAccountModel = WalletModel.WalletAccountSearch.getInstance();//用户信息model
    var exchgPhoneModel = WalletModel.PhoneRechargeModel.getInstance();
    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        //backToPage: null,
        preRecashAmt: 0,
        events: {
            'click .J_WalletRechargeList li': 'chooseRechgeAmt'
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);
            this.render();
            //this.bindEvent();
            this.initCommonEvent();
            this.getUserInfoFn();
            this.turning();
        },
        getUserInfoFn: function () {
            this.getUserInfoSer();
        },
        getUserInfoSer: function () {
            var self = this;
            this.showLoading();
            this.preRecashAmt = userAccountStore && userAccountStore.getAttr("rtcash");
            userAccountModel.param = { reqbmp: 2 };
            userAccountModel.exec({
                suc: this._getUserInfoSuc,
                scope: this,
                fail: function (data) {
                    self.onModelExecFail(data); //404
                },
                abort: function () {

                }
            });
        },
        _getUserInfoSuc: function (data) {
            var self = this;
            if (data.resbmp == 2) {
                var recashAmt = data.rtcash, isChanged = false;
                if (this.preRecashAmt != recashAmt) { isChanged = true; }
                this.els.recashAmt.text(recashAmt);
                this.getRechargetListFn(isChanged);
            } else {
                this.show404(function () {
                    self.hide404();
                    self.onShow();
                });
            }
        },
        getRechargetListFn: function (isChanged) {
            if (isChanged && InfoRechargedPhoneStore) { InfoRechargedPhoneStore.remove(); } //recash amount is changed
            this.getRechargeListSer();
        },
        getRechargeListSer: function () {
            var self = this;
            exchgPhoneModel.exec({
                suc: self._getRechargeList,
                scope: this,
                fail: function (data) {
                    self.onModelExecFail(data); //404
                },
                abort: function () {

                }
            });
        },
        _getRechargeList: function (data) {
            var self = this;
            this.hideLoading();
            self.procRcCode(data, false);//404
            if (data.rc == 0) {
                this.showRechargeList(data);
            }
        },
        render: function () {
            this.$el.html(_.template(this.tpl));
            this.els = {
                rechargeList: this.$el.find(".J_WalletRechargeList"),
                recashAmt: this.$el.find(".J_WalletRecashAmt")
            };
        },
        chooseRechgeAmt: function (e) {
            var ele = $(e.currentTarget);
            if (ele.attr("data-rgenabled") == "1") {
                this.clearAllSelectedCss();
                ele.addClass("cardselect");
                var listObj = InfoRechargedPhoneStore.getAttr("listObj");
                if (listObj) { listObj.selectedNo = ele.attr("data-rgindex"); InfoRechargedPhoneStore.setAttr("listObj", listObj); }
                this.back("exchgphone");
            }
        },
        clearAllSelectedCss: function () {
            $(".J_WalletRechargeList li").each(function (item) {
                $(item).removeClass("cardselect");
            });
        },
        showRechargeList: function (data) {
            var self = this;
            var listObj = InfoRechargedPhoneStore.getAttr("listObj") ;
            if (listObj) {
                this.showRechargeElements(listObj);
            } else {
                var rechargeList = [];
                listObj = {};
                var recash_amt = this.els.recashAmt.text();
                if (recash_amt) recash_amt = Number(recash_amt);
                if (!isNaN(recash_amt)) {
                    rechargeList = Util.getSignedRechargeArr(data.mobrclist, recash_amt);
                    var min_obj = _.min(rechargeList, function (ele) { return ele.recashamt });
                    var min_amt = min_obj.recashamt, min_recharge_amt = min_obj.rechargamt;
                    var _result = Util.compareTwoNum(recash_amt, min_amt);
                    switch (_result) {
                        case 0:
                            listObj.selectedNo = Util.getIndexByObj(rechargeList, min_obj);
                            break;
                        case 1:
                            var chargeObj = Util.getBestRechargeObj(rechargeList, recash_amt);
                            listObj.selectedNo = Util.getIndexByObj(rechargeList, chargeObj);
                            break;
                        case -1: //返现余额小于最低兑换金额
                            listObj.selectedNo = -1;
                            break;
                    }
                    listObj.list = rechargeList;
                    this.showRechargeElements(listObj);
                    InfoRechargedPhoneStore.setAttr("listObj", listObj);
                }
            }
        },
        showRechargeElements: function (listObj) {
            var self = this;
            var selectedNo = listObj.selectedNo;
            _.each(listObj.list || [], function (item, index) {
                if (!!item.enabled) {
                    self.els.rechargeList.append('<li class="' + (selectedNo == index ? 'cardselect' : '') + '" data-rgindex="' + index + '" data-rgenabled="' + (item.enabled ? 1 : 0) + '"><i><small>&yen;</small>' + item.rechargamt + '</i>需返现余额<span><small>&yen;</small>' + item.recashamt + '</span></li>');
                } else {
                    self.els.rechargeList.append('<li class="rechargeno" data-rgindex="' + index + '" data-rgenabled="' + (item.enabled ? 1 : 0) + '"><i><small>&yen;</small>' + item.rechargamt + '</i>返现余额不足，需<span><small>&yen;</small>' + item.recashamt + '</span></li>');
                }
            });
        },
        onHide: function () {
            this.inherited(arguments);
        }
    });

    return View;
});

