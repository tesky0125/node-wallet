/**
 * @author wxm
 * @desc:  Wallet V6.10
 */

define(['cGuiderService', 'text!insrcactivity_html', 'Util', 'Log', 'WalletPageView', 'WalletModel', 'Config', 'Message', 'ModelObserver', 'CacheData', 'CheckPsd', 'WalletStore', 'Scmg'],
    function(cGuiderService, html, Util, Log, WalletPageView, WalletModel, Config, Message, ModelObserver, CacheData, CheckPsd, WalletStore, Scmg) {

        var STRING = {
            PAGE_TITLE: '账户安全险',
            SHARE: '分享',
            KNOW: '知道了',
            LATE: '你来晚了'
        };

        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            //backToPage: 'index',
            events: {
                'click .J_INSRCTIPGO': function() {
                    this.forward('insrctips?p=1'); //p is insrc product id: insrctype in InsrcGetPrdInfo model
                },
                'click .J_INSCGO': function() {
                    if (!Util.checkUser(this, true)) {
                        return;
                    }

                    //is login, then check insrc switch is on/off
                    ModelObserver.register({
                        scope: this,
                        refresh: true,
                        showLoading: true,
                        model: 'PublicCheck',
                        param: {
                            reqtype: 4
                        },
                        cbSuc: function(data) {
                            if (data.rc === 0) {
                                if (data.desc === '0') {
                                    this.showDlg({
                                        message: STRING.LATE,
                                        buttons: [{
                                            text: STRING.KNOW,
                                            click: function() {
                                                this.hide();
                                            }
                                        }]
                                    });
                                    return;
                                } else {
                                    //insrc is on
                                    this._insrcCheck();
                                }
                            } else {
                                this.showToast(Message.get(123));
                            }
                        },
                        cbFail: function() {
                            this.showToast(Message.get(123));
                        }
                    });
                }
            },
            _insrcCheck: function() {
                ModelObserver.register({
                    scope: this,
                    refresh: true,
                    showLoading: true,
                    model: 'InsrcCheck',
                    param: {
                        insrctype: 1
                    },
                    cbSuc: function(data) {
                        if (data.rc === 0) {
                            if (!WalletStore.UserInfoStore.getInstance().hasUserData()) {
                                ModelObserver.register({
                                    showLoading: true,
                                    scope: this,
                                    refresh: true,
                                    model: 'WalletUserInfoSearch',
                                    param: {
                                        reqbmp: 0
                                    },
                                    cbSuc: function() {
                                        this._fwd2InsrcView(data);
                                    },
                                    cbFail: function() {
                                        this.showToast(Message.get(123));
                                    },
                                });
                            } else {
                                this._fwd2InsrcView(data);
                            }
                        } else {
                            this.showToast(Message.get(123));
                        }
                    },
                    cbFail: function() {
                        this.showToast(Message.get(123));
                    }
                });

            },
            _fwd2InsrcView: function(data) {
                if (data.ordstatus === 1 || data.ordstatus === 2) {
                    this.forward('insrcend?path=insrcactivity');
                } else {
                    if (data.authstatus === 1 || data.authstatus === 3 || data.authstatus === 100) {
                        //realnamed or realnaming, check if go to add insrc info...
                        if (data.insurequalif === 1 || data.insurequalif === 2) {
                            //qualified or unknow
                            this.forward('insrcaddinfo?path=insrcactivity');
                        } else {
                            this.forward('insrcend?path=insrcactivity');
                        }
                    } else if (data.authstatus === 0 || data.authstatus === 2) {
                        //not realnamed
                        CacheData.setIsFromInsrcAct(true);
                        this.checkPsd = new CheckPsd({
                            page: this,
                            sucCallBack: _.bind(this.goAddInfoFn, this),
                            psdStore: WalletStore.RealNameStore.getInstance(),
                            psdStyle: 2
                        })
                        this.checkPsd.goVerifyPwd()
                    }
                }
            },
            goAddInfoFn: function() {
                this.forward('addaccountinfo');
            },
            onCreate: function() {
                this.wxShare=Util.wxShareInsrcAct();
                if (Config.IS_INAPP) {
                    this.right = [{
                        'tagname': 'share',
                        callback:_.bind(this.wxShare.hybirdShare, this),
                    }];
                }
                this.inherited(arguments);

                this.render();
                this.turning();
            },
            render: function() {
                this.$el.html(_.template(this.tpl));
                this.els = {
                    'tip': this.$el.find('.J_INSRCTIP'),
                    'imgdiv': this.$el.find('.img100'),
                    'img': this.$el.find('.img100 img'),
                    'fill': this.$el.find('.J_BFILL'),
                    'secDiv': this.$el.find('.J_SCD')
                };
                this.els.tip.css('height', '42px'); //default height: 2 row

                //set img src
                this.els.img.attr('src', Util.getH5ImgUrl('yx_bg2.png'));
                this._setDivsHt();
            },
            onShow: function() {
                Scmg.clearA();
                this.inherited(arguments);

                if (Lizard.P('from')) {
                    CacheData.setInsrcActFrmParam(Lizard.P('from'));
                }

                this._onRizeFunc = _.bind(function() {
                    this._setDivsHt();
                }, this);
                $(window).on('resize', this._onRizeFunc);

                ModelObserver.register({
                    scope: this,
                    refresh: false,
                    showLoading: true,
                    model: 'WalletPublicQueryText',
                    param: {
                        reqtype: 14
                    },
                    cbSuc: function(data) {
                        this.els.tip.text(data.text);
                        this.els.tip.css('height', 'auto');

                        this._setDivsHt();
                    },
                    cbFail: function() {
                        this._setDivsHt();
                        //this.showToast(Message.get(123));
                    }
                });
            },
            onHide: function() {
                $(window).off('resize', this._onRizeFunc);
            },
            _setDivsHt: function() {
                var t;
                try {
                    t = parseInt(getComputedStyle(document.getElementsByClassName('J_SCD')[0]).width);
                } catch (e) {};
                var scrWidth = t ? t : window.innerWidth;

                var imgDivHt = Math.floor(scrWidth * 640 / 689);
                this.els.imgdiv.css('height', imgDivHt + 'px');
                var secDivHt = this.els.secDiv.height();
                if (window.innerHeight > imgDivHt + secDivHt) {
                    this.els.fill.css('height', (window.innerHeight - imgDivHt - secDivHt) + 'px');
                } else {
                    this.els.fill.css('height', '0px');
                }
            },
            returnHandler: function() {
                this.inherited(arguments);

            //     if (this.tokenInfoView && this.tokenInfoView.from) { //get from token param
            //         this.jump2TokenUrl(this.tokenInfoView.from);
            //         this.tokenInfoView = undefined; //clear ret page after used
            //         return true;
            //     }

            //     var tk = Util.getTokenInfoStore();
            //     if (tk && tk.from && tk.entryLast == 'insrcactivity') {
            //         this.jump2TokenUrl(tk.from);
            //         return true;
            //     }

            //     if (Config.IS_HYBRID) {
            //         this.back('index');
            //         return true;
            //     }

                // var from = CacheData.getInsrcActFrmParam();
                // if (from) {
                    CacheData.setInsrcActFrmParam(''); //reset it
                    CacheData.setIsFromInsrcAct(false);
                // }
            //     switch (from) {
            //         case 'share':
            //             if (Config.IS_INAPP) {
            //                 cGuiderService.backToLastPage();
            //             } else {
            //                 this.jump(Config.H5_MAIN_HOME_URL);
            //             }
            //             break;
            //         case 'ad':
            //             if (Config.IS_INAPP) {
            //                 cGuiderService.backToLastPage();
            //             } else {
            //                 this.back('index');
            //             }
            //             break;
            //         default:
            //             this.back('index');
            //     }

            //     return true;
            }
        });

        return View;
    });
