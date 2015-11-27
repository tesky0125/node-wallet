/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['WalletPageView', 'WalletModel', 'WalletStore', 'text!mybankcard_html', 'Message', 'PayVerify', 'ModelObserver', 'Config', 'Scmg'],
function (WalletPageView, WalletModel, WalletStore, html, Message, PayVerify, ModelObserver, Config, Scmg) {

    var STRING = {
        PAGE_TITLE: '我的银行卡',
        ALERT_TITLE: '您确定要删除所选中的常用卡记录？',
        CONFIRM: '确定',
        DELETE: '删除',
        CANCEL: '取消',
        EXPLAIN: '说明',
        FREEZE_ALERT: '您的账户处于冻结状态，目前无法操作，如需帮助请联系携程客服。',
        PSD_ALERT_TITLE: '您尚未设置支付密码，请先进行设置。',
        GO_SETTING: '去设置',
        CTRIP_PAY_TITLE: '携程支付密码',
        PLEAD_INPUT_PSD: '请输入携程支付密码，以完成身份验证'
    };

    var noCardTemplate = '<div class="J_NoCard center t_c">' +
                         '<div class="icon_mycard"></div>' +
                         '<h2>您还没有常用银行卡</h2>' +
                         '<div class="grey">可以在支付订单时，保存常用银行卡</div>' +
                         '</div>';

    var msg = '<div class="paytips white" >' +
                '<h2 class="t_c card-bor">卡状态说明</h2>' +
                '<div class="green">待验证</div>' +
                '<p class="card-bor">该卡正在等待银行验证，暂不可作为常用卡使用，仍需输入完整信息支付</p>' +
                '<div class="c38b800">已验证 </div>' +
                '<p class="card-bor">该卡已通过银行验证，可作为常用卡使用</p>' +
                '</div>';

    var itemTemplate =
        '<li>' +
        '<figure class="<%=cardIcon%> default"></figure>' +
        '<div class="h40">' +
        '<span class="font16 pr12"><%=banknameShort%></span><em class="cardclass"><%=cardtypeUI%></em>' +
            '<p class="font14">' +
                '<em class="fr blue J_Delete"  data-cardid="<%=cardid%>" data-cardtype="<%=cardtype%>" data-infoid="<%=infoid%>">删除</em>' +
                '<span class="grey2 font14"><%=cardno%></span>' +
            '</p>' +
        '</div>' +
        '</li>';

    var addCardTemplate =
        '<ul class="border2 p10_15li iconbank" style="border-top:none;">' +
        '<li class="J_addNo">' +
        '<figure class="newadd"></figure>' +
        '<div>新增常用卡</div>' +
        '<div class="font10 grey2">最多可保存10张银行卡</div>' +
        '</li>' +
        '</ul>';

    var userStore = WalletStore.UserInfoStore.getInstance();
    var bindCardStore = WalletStore.BindCardStore.getInstance();

    var View = WalletPageView.extend({
        headerBtn: { title: STRING.EXPLAIN, id: 'J_Explain', classname: 'explain' },
        commitHandler: {
            id: 'J_Explain', callback: function () {
                this.getCstMsg().showMessage(msg);
            }
        },
        title: STRING.PAGE_TITLE,
        backBtn: true,
        //backToPage: 'index',
        events: {
            'click .J_Delete': 'deleteCard',
            'click .J_addNo': 'addCardNo'
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            Scmg.clearA();
            this.inherited(arguments);
            if (bindCardStore.getAttr('dataChanged')) {
                bindCardStore.setAttr('dataChanged', null);
                ModelObserver.register({
                    scope: this,
                    refresh: true,
                    model: 'WalletUserInfoSearch',
                    param: { reqbmp: 0 }
                });
            }

            //清除上次绑卡流程残留数据.
            bindCardStore.remove();

            this.getData();
        },
        getData: function () {
            var that = this;
            this.loading.show();
            var bankCardModel = this.bankCardModel = WalletModel.WalletBindedCreditCardListSearch.getInstance();
            bankCardModel.param = {};
            bankCardModel.param.reqtype = 2;
            bankCardModel.param.authstatus = 0;
            bankCardModel.param.paymchid = Config.PAYMCHIDS.BINDCARD;

            var _param = { 'PayChannel': 'PayUsedCard' };
            bankCardModel.param.scenparam = JSON.stringify(_param);

            var publicCheckModel = WalletModel.PublicCheck.getInstance();
            publicCheckModel.param = {};
            publicCheckModel.param.reqtype = 2;
            publicCheckModel.param.paymchid = Config.PAYMCHIDS.BINDCARD;
            publicCheckModel.exec({
                scope: this,
                suc: function (data) {
                    this.procRcCode(data, true, true);
                    if (data.rc == 0) {
                        this.desc = data.desc;
                    }
                },
                fail: function (data) { }
            });

            bankCardModel.exec({
                suc: function (info) {
                    that.loading.hide();
                    that.procRcCode(info);
                    if (info.rc == 0) {
                        that.render(info);
                    }
                },
                fail: this.onModelExecFail,
                scope: this
            })
        },
        render: function (info) {
            var that = this;
            this.$el.html(html);
            this.container = this.$el.find('.J_WalletContainer');

            var f = '';
            if (info.haveVali.length > 0) {
                f += '<div class="p10_15 grey2 lh1 J_HasValiTitle">已经验证的银行卡</div>';
                f += '<ul class="border2 p10_15li iconbank J_HasValiUl">';
                for (var i = 0; i < info.haveVali.length; i++) {
                    f += _.template(itemTemplate, info.haveVali[i]);
                }
                f += '</ul>';
            }

            if (info.waitvali.length > 0) {
                f += '<div class="p10_15 grey2 lh1 J_WaitValiTitle">待验证的银行卡</div>';
                f += '<ul class="border2 p10_15li iconbank J_WaitValiUl">';
                for (var i = 0; i < info.waitvali.length; i++) {
                    f += _.template(itemTemplate, info.waitvali[i]);
                }
                f += '</ul>';
            }

            f += addCardTemplate;

            this.container.html(f);

            var cardNum = this.cardNum = info.haveVali.length + info.waitvali.length;

            if (cardNum >= 10) {
                this.$el.find('.J_addNo').addClass('newaddno');
            }

            this.checkHasDelAll();

            that.turning();
        },
        addCardNo: function () {
            var that = this;

            if (this.$el.find('.J_addNo').hasClass('newaddno')) {
                return;
            }

            var accountInfo = userStore.get();

            if (this.desc == 1) {
                //如果实名认证开关开启 才验证 账户状态/是否有设置密码/指纹/密码
                if (accountInfo.userstatus == 2) {
                    this.showDlg({
                        message: STRING.FREEZE_ALERT,
                        buttons: [{
                            text: STRING.CONFIRM,
                            click: function () {
                                this.hide();
                            }
                        }]
                    });
                    return;
                }

                if (!accountInfo.haspwd) {
                    this.showDlg({
                        message: STRING.PSD_ALERT_TITLE,
                        buttons: [{
                            text: STRING.CANCEL,
                            click: function () {
                                this.hide();
                            }
                        }, {
                            text: STRING.GO_SETTING,
                            click: function () {
                                this.hide();
                                that.forward('setpaypsd2');
                            }
                        }]
                    });
                    return;
                }

                this.valiPassWordOrFinger();
            } else {
                this.forward('addcard?path=bindcard');
            }
        },
        valiPassWordOrFinger: function () {
            PayVerify.exec(this, {
                success: function (data) {
                    // var bindCardStore = WalletStore.BindCardStore.getInstance();
                    // bindCardStore.setAttr('verifytype', data.verifytype);
                    // if (data.verifytype == 1) {
                    //     ///bindCardStore.setAttr('pwd', data.pwd);
                    //     Scmg.setP(data.pwd);
                    // } else {
                    //     bindCardStore.setAttr('requestid', data.requestid);
                    //     ///bindCardStore.setAttr('paytoken', data.paytoken);
                    //     Scmg.setT(data.paytoken);
                    //     bindCardStore.setAttr('keyguid', data.keyguid);
                    //     bindCardStore.setAttr('devguid', data.devguid);
                    // }

                    this.forward('addcard?path=bindcard');
                }
            });

        },
        deleteCard: function (e) {
            var that = this;

            this.delBtn = e.target;
            var $dom = $(e.target);
            var infoid = $dom.attr('data-infoid');
            var cardtype = $dom.attr('data-cardtype');
            var cardId = $dom.attr('data-cardid');

            var walletDelete = WalletModel.WalletBindedCreditCardDelete.getInstance();
            walletDelete.param.infoid = infoid;
            walletDelete.param.cardtype = cardtype;
            walletDelete.param.cardid = cardId;
            walletDelete.param.reqtype = 2;

            //alert flag avoid showing multi dialog
            if (!that.alert || that.alert.status != Config.FRW_UI_STATUS.SHOW) {
                that.showDlg({
                    message: STRING.ALERT_TITLE,
                    buttons: [{
                        text: STRING.CANCEL,
                        click: function () {
                            this.hide();
                        }
                    }, {
                        text: STRING.DELETE,
                        click: function () {
                            var _that = this;
                            that.loading.show();
                            this.hide();
                            walletDelete.exec({
                                suc: function (info) {
                                    that.cardNum--;
                                    that.loading.hide();
                                    that.procRcCode(info, true);
                                    if (info.rc == 0) {
                                        $(that.delBtn).parents('li').remove();
                                        that.checkHasDelAll();
                                        that.showToast(Message.get(111));
                                    }
                                },
                                fail: function (data) {
                                    that.onModelExecFailAsync(data, 323);
                                },
                                scope: that
                            });
                        }
                    }]
                });
            }
        },
        checkHasDelAll: function () {
            if (this.$el.find('.J_WaitValiUl').children().length == 0) {
                this.$el.find('.J_WaitValiUl').remove();
                this.$el.find('.J_WaitValiTitle').remove();
            }

            if (this.$el.find('.J_HasValiUl').children().length == 0) {
                this.$el.find('.J_HasValiUl').remove();
                this.$el.find('.J_HasValiTitle').remove();
            }

            if (this.cardNum < 10 && this.$el.find('.J_addNo').hasClass('newaddno')) {
                this.$el.find('.J_addNo').removeClass('newaddno');
            }

            /*
            if (this.cardNum == 0) {
            this.container.html(noCardTemplate);
            } else {
            this.container.find('.J_NoCard').remove();
            }
            */
        },
        onHide: function () {
            this.inherited(arguments);
            this.alert && this.alert.hide();
        }
    });

    return View;
});

