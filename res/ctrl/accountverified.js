/**
 * @author chen.yun
 * @desc:  Wallet V6.7
 */
define(['WalletPageView', 'WalletModel', 'WalletStore', 'text!accountverified_html', 'Util', 'Config', 'Message',  'CacheData', 'ModelObserver', 'GetCerList', 'CheckPsd'],
    function(WalletPageView, WalletModel, WalletStore, html, Util, Config, Message,  CacheData, ModelObserver, GetCerList, CheckPsd) {
        var STRING = {
            ACCOUNT_VERIFIED_TITLE: '账户实名认证',
            CANCEL: '放弃',
            GO_SETTING: '去设置',
            CONFIRM: '知道了',
            VERIFIED_NO: '账户实名认证，保障资金安全',
            VERIFIED_YES: '账户已实名认证',
            VERIFIED_ING: '实名信息正在审核中',
            AUTHTEXT: '实名认证信息无法修改。携程钱包中的返现和现金只能转出至以下实名信息的银行卡。'
        };
        var userInfoStore = WalletStore.UserInfoStore.getInstance();
        var realNameStore = WalletStore.RealNameStore.getInstance();
        var realNameVerifyStore = WalletStore.RealNameVerifyStore.getInstance();
        var certListStore = WalletStore.CertListStore.getInstance();
        var certListModel = WalletModel.QueryCertList.getInstance();
        var realNameCardStore = WalletStore.RealNameCardStore.getInstance();
        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.ACCOUNT_VERIFIED_TITLE,
            backBtn: true,
            onCreate: function() {
                this.inherited(arguments);
            },
            events: {
                'click .J_GoSet': '_goAddAccountInfo',
                'click .J_GoAuthByBank': '_goAuthByBank'
            },
            onShow: function() {
                this.inherited(arguments);
                this.model = {};
                var that = this;
                this.vtext = '';
                this.loading.show();
                var _queryTextModel = WalletModel.WalletPublicQueryText.getInstance();
                _queryTextModel.param = {};
                this.as = userInfoStore.getAttr("authstatus"); //
                this.idtype = userInfoStore.getAttr("idtype");
                this.cardTypeString = userInfoStore.getAttr("cardTypeString") || '';
                var ctrpuid = userInfoStore.getAttr("ctrpuid");
                this.ctrpuid = ctrpuid&&Util.formatCtrpUid(ctrpuid);
                if (this.as == 0 || this.as == 2) {
                    _queryTextModel.param.reqtype = 10;
                } else {
                    _queryTextModel.param.reqtype = 12;
                    if (!(this.cardTypeString&&this.idtype==userInfoStore.getAttr("oldCardType"))) {
                       this.getCerList = new GetCerList({
                            page:this,
                            isRealName: false,
                            callback: _.bind(this.cerListCallback, this),
                            getPaymchid: Config.PAYMCHIDS.DEFAULT,
                        })
                    }
                }
                _queryTextModel.exec({
                    suc: function(data) {
                        this.loading.hide();
                        if (data.rc == 0) {
                            this.vtext = data.text;
                        }
                        that.render();
                        that.turning();
                    },
                    fail: function(data) {
                        this.onModelExecFailAsync(data, 330);
                    },
                    scope: this
                });
                this.checkPsd = new CheckPsd({
                        page: that,
                        psdStore: WalletStore.RealNameStore.getInstance(),
                        psdStyle:2
                    })
                    //M10ZH-1132
                this.$el.addClass("height100");
            },
            cerListCallback: function(list) {
                    this.cardTypeString = Util.getIdCardType(false,this.idtype);
                    userInfoStore.setAttr('oldCardType',this.idtype);
                    userInfoStore.setAttr('cardTypeString', this.cardTypeString);
            },
            onHide: function() {
                this.inherited(arguments);
            },
            render: function() {
                var that = this;
                if (this.as == 0 || this.as == 2) { //未实名认证
                    this.aStatus = 0;
                    this.asText = STRING.VERIFIED_NO;
                } else if (this.as == 1) { //已认证
                    this.aStatus = 1;
                    this.asText = STRING.VERIFIED_YES;
                } else { //认证中
                    this.aStatus = 2;
                    this.asText = STRING.VERIFIED_ING;
                }

                var _model = {
                    authStatus: this.aStatus,
                    as: this.as,
                    authText: this.vtext,
                    idtype: this.idtype,
                    asText: this.asText,
                    cardTypeString: this.cardTypeString,
                    userName: userInfoStore.getBase64("username"),
                    idNo: userInfoStore.getAttr("idno"),
                    ctrpuid: this.ctrpuid
                };
                this.$el.html(_.template(this.tpl, _model));
            },

            _goAddAccountInfo: function() {
                realNameStore.setAttr('rnType', 'idcard');
                this.checkPsd.setSucCallBack(this.goAddInfoFn);
                this.checkPsd.goVerifyPwd()
            },
            goAddInfoFn: function() {
                this.forward('addaccountinfo');
            },
            _goAuthByBank: function() {
                realNameStore.setAttr('rnType', 'bank');
                this.checkPsd.setSucCallBack(this.goBankFn)
                this.checkPsd.goVerifyPwd()
            },
            goBankFn: function(argument) {
                this.forward('addcard?path=realname');
            },
            //returnHandler: function() {
            //    if (this.tokenInfoView && this.tokenInfoView.from) {
            //        this.jump2TokenUrl(this.tokenInfoView.from);
            //        this.tokenInfoView = undefined; //clear ret page after used
            //        return true;
            //    }
            //
            //    if (this.retPage) {
            //        this.back(decodeURIComponent(this.retPage));
            //        return true;
            //    }
            //
            //    var tk = Util.getTokenInfoStore();
            //    if (tk && tk.from && tk.entryLast == 'accountverified') {
            //        this.jump2TokenUrl(tk.from);
            //        return true;
            //    }
            //
            //    if (tk && tk.entryLast == 'index') {
            //        this.back('index');
            //        return true;
            //    }
            //
            //    var rt = Util.getRetPage(this.viewname);
            //    if (rt) {
            //        this.back(rt);
            //        Util.clearRetPage(this.viewname);
            //        return true;
            //    }
            //
            //    this.back('index');
            //    return true;
            //}
        });

        return View;

    });
