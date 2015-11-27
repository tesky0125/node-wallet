/**
 * @author chen.yun
 * @desc:  Wallet V6.12
 */

define(['cGuiderService', 'text!insrcstart_html', 'Util', 'Log', 'WalletPageView', 'WalletModel', 'Config', 'Message', 'ModelObserver', 'CacheData', 'CheckPsd', 'WalletStore', 'Scmg'],
    function(cGuiderService, html, Util, Log, WalletPageView, WalletModel, Config, Message, ModelObserver, CacheData, CheckPsd, WalletStore, Scmg) {

        var STRING = {
            PAGE_TITLE: '账户安全险',
            SHARE: '分享',
            OK: '好的',
            LATE: '你来晚了',
            SHOW_MESSAGE: '抱歉，同一个携程账户，只能够购买一次该保险产品'
        };
        var InsrcCheckModel = WalletModel.InsrcCheck.getInstance();
        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            //backToPage: 'index',
            events: {
                'click .J_INSRCTIPGO': function() {
                    this.forward('insrctips?p=' + this.getQuery("insrctype")); //p is insrc product id: insrctype in InsrcGetPrdInfo model
                },
                'click .J_Insrc_Claim': function(e) {
                    var phone = $(e.currentTarget).attr('data-phone');
                    Util.callPhone(phone);
                },
                'click .J_INSCGO': function() {
                    if (!Util.checkUser(this, true)) {
                        return;
                    }
                    this.isClick = true;
                    //is login, then check insrc switch is on/off
                    this._insrcCheck();
                }
            },
            onCreate: function() {
                this.wxShare = Util.shareHighInsrcAct();
                if (Config.IS_INAPP) {
                    this.right = [{
                        'tagname': 'share',
                        callback: _.bind(this.wxShare.hybirdShare, this),
                    }];
                }
                this.inherited(arguments);
                this.turning();
            },
            onShow: function() {
                Scmg.clearA();
                this.inherited(arguments);
                this.isClick = false;
                if (Util.checkLogin()) {
                    this._insrcCheck();
                } else {
                    this._getInsrcInfo();
                }
            },
            render: function() {
                this.$el.html(_.template(this.tpl, this.model));
                this._els = {
                    $insrcDetailList: this.$el.find(".J_InsrcDetailList")
                };

                var insrcListUI = this.buildListUI();
                this._els.$insrcDetailList.append(insrcListUI);

                this.turning();
            },
            buildListUI: function() {
                var ret = '';
                for (var i = 0; i < this.model.insoitemlist.length; i++) {
                    var item = this.model.insoitemlist[i];
                    var html = '<li><i></i><span>' + item.name + '</span>';
                    if (item.itemtype === 0) {
                        html += '<div>' + item.value + '</div></li>';
                    } else if (item.itemtype === 1) {
                        html += '<div class="red3">' + item.value + '</div></li>';
                    }
                    ret += html;
                }
                return ret;
            },
            _getInsrcInfo: function() {
                this.loading.show();
                ModelObserver.register({
                    scope: this,
                    refresh: false,
                    showLoading: true,
                    model: 'InsrcGetPrdInfo',
                    param: {
                        reqtype: 1,
                        insrctype: parseInt(this.getQuery('insrctype'))
                    },
                    cbSuc: function(data) {
                        if (data.rc === 0) {
                            this.loading.hide();
                            this.model = data;
                            this.render();
                        } else {
                            this.onModelExecFail(data);
                        }
                    },
                    cbFail: this.onModelExecFail
                });
            },
            buildListUI: function() {
                var ret = '';
                for (var i = 0; i < this.model.insoitemlist.length; i++) {
                    var item = this.model.insoitemlist[i];
                    var html = '<li><i></i><span>' + item.name + '</span>';
                    if (item.itemtype == 0) {
                        html += '<div>' + item.value + '</div></li>';
                    } else if (item.itemtype == 1) {
                        html += '<div class="J_Insrc_Claim" data-phone="' + item.value + '">' + item.value + '</div></li>';
                    } else if (item.itemtype == 2) {
                        html += '<div class="red3" >' + item.value + '</div></li>';
                    }
                    ret += html;
                }
                return ret;
            },
            _insrcCheck: function() {
                this.loading.show();
                InsrcCheckModel.param.insrctype = parseInt(this.getQuery('insrctype'));
                InsrcCheckModel.exec({
                    scope: this,
                    suc: function(data) {
                        this.loading.hide();
                        if (data.rc == 0) {
                            this._fwd2InsrcView(data);
                        } else {
                            this.isClick?this.onModelExecFailAsync(data):this.onModelExecFail(data);
                        }
                    },
                    fail: this.onModelExecFail
                });
            },
            _fwd2InsrcView: function(data) {
                var _that = this;
                if (data.ordstatus === 2) {
                    if (this.isClick) {
                        this.showDlg({
                            message: STRING.SHOW_MESSAGE,
                            buttons: [{
                                text: STRING.OK,
                                click: function() {
                                    _that.forward('myinsrc');
                                    this.hide();
                                }
                            }]
                        });
                    } else {
                        this.loading.show()
                        setTimeout(function() {
                            _that.loading.hide();
                            _that.forwardWithRetView('myinsrcdetail?orderid=' + data.orderid+'&insrctype='+_that.getQuery('insrctype'), 'myinsrc');
                        }, 500)
                    }
                } else {
                    if (this.isClick) {
                        switch (data.authstatus) {
                            case 1:
                                //realnamed, check if go to add insrc info...
                                if (data.insurequalif === 1 || data.insurequalif === 2) {
                                    //qualified or unknow
                                    this.forward('insrcaddinfo?path=insrcstart');
                                } else {
                                    this.forward('insrcend?path=insrcstart');
                                }
                                break;
                            case 100:
                            case 3:
                                this.forward('insrcend?path=insrcstart');
                                break;
                            default:
                                //not realnamed
                                //loading
                                CacheData.setIsFromInsrcAct(true);
                                this.checkPsd = new CheckPsd({
                                    page: this,
                                    sucCallBack: _.bind(this.goAddInfoFn, this),
                                    psdStore: WalletStore.RealNameStore.getInstance(),
                                    psdStyle: 2
                                })
                                this.checkPsd.goVerifyPwd()
                                break;
                        }
                    } else {
                        this._getInsrcInfo();
                    }
                }
            },
            goAddInfoFn: function() {
                this.isClick = false
                this.forward('addaccountinfo?path=insrcstart');
            },
            returnHandler: function() {
                this.inherited(arguments);
                this.isClick = false;
                CacheData.setIsFromInsrcAct(false);
            }
        });

        return View;
    });