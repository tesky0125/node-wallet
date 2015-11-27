/**
 * @module walletpageview
 * @author luzx, wxm
 * @description wallet base page view for all wallet standalone pages
 * @version since Wallet V5.7
 */
define(['PageManager', 'Log', 'CommonStore', 'cPageView', 'WalletStore', 'Message', 'Config', 'Util', 'text!404warning_html', 'cGuiderService', 'VerfiedpsdFloat', 'MockModel', 'CustomMessage', 'PageMap', 'Scmg'],
    function(PageManager, Log, CommonStore, cPageView, WalletStore, Message, Config, Util, warninghtml, cGuiderService, VerfiedpsdFloat, MockModel, CustomMessage, PageMap, Scmg) {
        'use strict';

        Util.onWalletInit();
        var pageManager = PageManager.getInstance();

        if (Config.IS_INAPP) {
            CtripPage.app_enable_drag_animation(false);
        } //关闭右滑返回上一个页面//TODO
        var AbstractPageView = cPageView.extend({
            backToPage: null,
            /* abstract property */
            //commit: null,/* abstract property */
            headerBtn: null,
            /* abstract property */
            title: "",
            /* abstract property */
            ads: false,
            /* abstract property */
            tel: false,
            /* abstract property */
            backBtn: false,
            /* abstract property */
            homeBtn: false,
            /* abstract property */
            citybtn: null,
            /* abstract property */
            citybtnImagePath: null,
            /* abstract property */
            bIgnoreBackKey: false,
            /* when click back button, ignore mask layer and disable back key action*/
            citybtnHandler: undefined,
            psd: VerfiedpsdFloat,
            ubtMap: [ /*{target:'',key:'',data:function(){return {};},cb:null}*/ ],
            onCreate: function() {
                /* abstract function */
                Util.bindCommonApi(this);

                Util.preprocEvents(this);

                //this.injectHeaderView(); //lizard2.0 mark
                this.initRouteEvent();
            },
            pageReg: /([_a-zA-Z0-9]*).*/i,
            /**
             * @param view target view name to be forwarded, can be with additional page param
             * @return none
             */
            forward: function(view, recreate) {
                //clear ubt listener
                this.unsetUBTListener();
                //console.log('this.viewname: ' + this.viewname);
                // var _view = view.replace(this.pageReg, '$1');
                // var forceCreateInstance = Util.getPageParam(this, view, 'recreate');
                // if (recreate !== undefined) {
                //     forceCreateInstance = recreate;
                // }
                // Lizard.goTo(view, {
                //     "viewName": _view,
                //     forceCreateInstance: forceCreateInstance
                // });
                pageManager.forward(view, recreate);
            },
            /**
             * @param string back.
             * @description call it will back any page in cache.
             */
            back: function(view) {
                pageManager.back(view);
                // if (!!view) {
                //     var _view = view ? view.replace(this.pageReg, '$1') : this.refererPage;
                //     Lizard.goBack(view, {
                //         "viewName": _view
                //     });
                // } else {
                //     //TODO: back() to exit wallet?
                //     if (Config.IS_INAPP) { //
                //         cGuiderService.backToLastPage();
                //     } else {
                //         Lizard.goBack();
                //     }
                // }
            },
            /**
             * @description all instance will call this function to set its header atuo.
             */
            setHeaderView: function() {
                var that = this;
                //var headviewParam = this.headviewParam = {
                this.headviewParam = {
                    ///citybtn: this.citybtn,
                    citybtnImagePath: this.citybtnImagePath,
                    title: this.title,
                    view: this,
                    ///btn: this.headerBtn,
                    home: this.homeBtn || false,
                    back: this.backBtn || false,
                    openAds: this.ads || false,
                    tel: this.tel ? {
                        number: Config.SERVICE_TEL_NUMBER
                    } : false,
                    right: this.right,
                    events: {
                        ///citybtnHandler: function () { that.citybtnHandler.call(that);},
                        returnHandler: function() {
                                if (that.bIgnoreBackKey) {
                                    //that.bIgnoreBackKey = false;//reset
                                    //that.returnHandler.call(that);
                                    return;
                                }

                                if (!that.tryHideMaskLayers()) { //close mask layer first
                                    that.returnHandler.call(that);
                                }
                            }
                            ///commitHandler: function () { that.commitHandler.callback.call(that);}
                    }
                };
                if (this.citybtn) {
                    this.headviewParam.citybtn = this.citybtn;
                    this.headviewParam.events.citybtnHandler = function() {
                        that.citybtnHandler.call(that);
                    };
                }
                if (this.headerBtn) {
                    this.headviewParam.btn = this.headerBtn;
                    this.headviewParam.events.commitHandler = function() {
                        that.commitHandler.callback.call(that);
                    };
                }
                ///this.headerview.set(headviewParam);
                this.headerview.set(this.headviewParam);
                this.headerview.show();
            },
            /**
             * @param newParam is a obejct, will overwrite current param
             * @description all instance will call this function to set its header atuo.
             */
            resetHeaderView: function(newParam) {
                var param = this.headviewParam = Util.mix(this.headviewParam, newParam);
                //Fix laizard bug
                var viewname = Util.getViewName();
                if (this.viewname === viewname) {
                    this.headerview.set(param);
                    //this.headerview.trigger('onShow');
                }
            },
            /**
             *@description  base onload function ,all instance will call it.
             */
            onShow: function() {
                this.setHeaderView();

                //back page: url token > url retpage > hardcode backToPage > referer
                // var tk = Util.getTokenFromUrl();
                // if (tk) { //back page will overwrite original token, so keep old token
                // this.tokenInfoView = tk;
                // } else {
                // var retPage = Util.getRetpage();
                // retPage && (this.retPage = retPage);
                // }

                //TODO
                this.refererPage = Util.getReferrerPage(this);

                if (!this.viewname) {
                    this.viewname = Util.getViewName();
                }
                VerfiedpsdFloat.init(this);

                this.setPageId();
                this.setUBTListener();

                //to fix framework issue, cause onCreate triggered twice
                // var purl = this.$el.attr('page-url').replace(/^\/webapp\/wallet\//, "");
                // this.$el.attr({
                //     'page-url': purl
                // });

                pageManager.bind(this);
            },
            // forwardWithToken: function(targetView, isJump) {
            //     if (Config.IS_HYBRID) { //
            //         var hash = location.hash;
            //         hash = hash.replace('#' + this.viewname, targetView); //remove #
            //         hash = decodeURIComponent(hash); //Lizard2.0 Hybrid will encode forwad address/param, so as not to encode twice
            //         this.forward(hash);
            //     } else {
            //         var url = location.href;
            //         url = url.replace('/wallet/' + this.viewname, '/wallet/' + targetView);

            //         if (isJump) {
            //             this.jump(url, true); //no history
            //         } else {
            //             this.forward(url);
            //         }
            //     }
            // },
            //TODO
            forwardWithRetView: function(targetView, retPage) {
                retPage = retPage.replace(/^#/, "");
                retPage = encodeURIComponent(retPage);
                if (targetView.indexOf("?") == -1) {
                    if (retPage) {
                        this.forward(targetView + '?retpage=' + retPage);
                    } else {
                        this.forward(targetView);
                    }
                } else {
                    this.forward(targetView + '&retpage=' + retPage);
                }
            },
            //getRetPageAndParam: function() {
            //    if (Config.IS_HYBRID) { //
            //        return location.hash.replace(/#/i, '');
            //    } else {
            //        return location.href.replace(/.*wallet\/([_a-zA-Z0-9]*)/i, '$1');
            //    }
            //},
            //forwardWithRetView: function(targetView, retPage) {
            //    retPage = retPage.replace(/^#/, "");
            //    retPage = encodeURIComponent(retPage);
            //    if (targetView.indexOf("?") == -1) {
            //        if (retPage) {
            //            this.forward(targetView + '?retpage=' + retPage);
            //        } else {
            //            this.forward(targetView);
            //        }
            //    } else {
            //        this.forward(targetView + '&retpage=' + retPage);
            //    }
            //},
            //forwardWithMyView: function(targetView) {
            //    this.forwardWithRetView(targetView, this.viewname)
            //},
            //forwardWithRetParam: function(targetView) {
            //   this.forwardWithRetView(targetView, this.getRetPageAndParam())
            //},
            getCstMsg: function() {
                this.cstMsg = new CustomMessage();
                return this.cstMsg;
            },
            /**
             * @description when page hide, the alert dialog and cstMsg dialog will auto hide if you defined it.
             */
            onHide: function() {
                /* abstract function */
                if (!Config.IS_INAPP) { //TODO
                    this.tryHideMaskLayers();
                }
                this.bIgnoreBackKey = false;
            },
            /**
             * @description to hide mask layer like custommessage, alert, popup select, mask dialogs...
             */
            tryHideMaskLayers: function() {
                var ret = false;
                if (this.alert && this.alert.hide && typeof(this.alert.hide) == 'function' && this.alert.status == Config.FRW_UI_STATUS.SHOW) {
                    this.alert.hide();
                    this.alert = null;
                    ret = true;
                }
                if (this.cstMsg && this.cstMsg.visible()) {
                    this.cstMsg.close();
                    this.cstMsg = undefined;
                    ret = true;
                }
                return ret;
            },
            /*
            return:
                0: server response invalid
                1: valid
                -1: unknow
            */
            //6.10: login alert refact, not show it
            // checkAuthValidity: function (data) {
            //     if (!data) {
            //         return -1;
            //     }
            //     var rc = data.rc;
            //     if (rc == Config.RC_CODE.AUTH_NONE || rc == Config.RC_CODE.AUTH_INVALID || rc == Config.RC_CODE.AUTH_EXP) {
            //         Util.showLoginAlert(this);
            //         return 0;
            //     } else {
            //         return 1;
            //     }
            // },
            /**
             * @description is a important function. if you call ajax, you can call it as a fail function. and it wont show 404 page.
             */
            onModelExecFailAsync: function(data, toastErrorCode) {
                this.loading.hide();
                toastErrorCode = toastErrorCode || 330;

                //6.10: not necessary, just toast is ok
                //if (!this.checkAuthValidity(data)) {
                //    return;
                //}
                if (Config.IS_INAPP) { //
                    //if in app, it will show more detail information from app.
                    var errorInfo;
                    if (data && data.errorInformation) {
                        errorInfo = data.errorInformation;
                    } else {
                        errorInfo = Message.get(toastErrorCode);
                    }
                    this.showToast(errorInfo);
                } else {
                    this.showToast(Message.get(toastErrorCode));
                }
            },
            onModelExecFailRcNotZero: function(data) {
                this.loading.hide();
                this.procRcCode(data);
            },
            getExecErrMsg: function(data) {
                //6.12 change: in case cbu code exception, cbu may return debug message to rmsg, so translate to proper user-friendly words
                if (data && data.errorInformation) {
                    return data.errorInformation;
                } else {
                    return Message.get(123);
                }
                // if (data) {
                //     if (data.rmsg) {
                //         return data.rmsg;
                //     } else if (data.errorInformation) {
                //         return data.errorInformation;
                //     }
                // } else {
                //     return '';
                // }
            },
            /**
             * @description is a important function. when you call it in ajax. it will show 404 error page when failed.
             */
            onModelExecFail: function(data) {
                var that = this;
                this.loading.hide();
                //应用架构说明：auth失效通过业务rc来判断，不在head的errcode
                //H5框架在errcode为0也可能呼叫exec fail，所以兼容一下  2014.6.16

                //6.10: login alert refact, not show it
                //TODO: check auth in basemodel?
                //if (this.checkAuthValidity(data)) {
                this.show404(function() {
                    that.hide404();
                    that.onShow();
                }, this.getExecErrMsg(data));
                //}
            },
            // tokenInfo: function() {
            //     return this.tokenInfoView;
            // },
            // clearMyTokenInfo: function() {
            //     this.tokenInfoView = undefined;
            // },
            getEntryView: function() {
                return Util.getEntryView();
            },
            //服务调用返回的错误码由7位数字组成：AABBCC，其中AA表示错误类型
            //其中AA表示错误类型
            //10：系统及应用异常；
            //11：参数错误；
            //12：请求依赖服务超时；
            //13：服务不可用；
            //14：服务返回错误；
            //15：操作受限或非法；
            //1402003	Auth未设置
            //1402004	Auth不合法
            //1402005	Auth过期
            //1403001	验证码次数超限

            /*

             */
            /**
             * @description Very important function. Every ajax callback function should call it first!!! it will do sth according to rc. you should read it carefully.
             * @return true for no further processing, otherwise false
             */
            procRcCode: function(data, isAsync, doNotToastIfNotSysErr) {
                var rc = data.rc;

                if (rc == 0) {
                    return false;
                }

                //6.10: login alert refact, not check auth validity in procRcCode
                //if (!this.checkAuthValidity(data)) {
                //    return true;
                //}
                if (data.rc == Config.RC_CODE.ACCNT_NOT_SUP_WLT) {
                    Util.showAcntUnsupAlert(this);
                    return true;
                }

                if (rc >= 1000000 && rc < 1100000) {
                    Log.Info('back to previous page because service return rc is: ' + rc);
                    var that = this;
                    this.showToast(data.rmsg, function() {
                        that.returnHandler(); //back to previous page
                    });
                    return true;
                }

                if (!isAsync) {
                    this.onModelExecFail(data); //show 404
                    return true;
                } else {
                    var banList = [Config.RC_CODE.IDENTIFIED_CODE_LIMIT];
                    if (banList.indexOf(rc) != -1) {
                        return true;
                    }

                    if (doNotToastIfNotSysErr) {
                        return true;
                    }

                    this.showToast(data.rmsg);
                    return true;
                }
            },
            /**
             * @description exit Wallet module, if in app, will backToLastPage, if in h5, will jump to home page
             */
            exitWalletModule: function() {
                //if (Config.IS_INAPP) { //
                //    cGuiderService.backToLastPage();
                //} else {
                //    this.jump(Config.H5_MAIN_HOME_URL); //all verification fail, go to home, TBD
                //}
                pageManager.exit();
            },
            //getOriginalRetpage: function() {
            //    while (this.retPage && this.retPage.match(/^\w+%/i)) {
            //        this.retPage = decodeURIComponent(this.retPage);
            //    }
            //},
            /**
             * @description Important function. Every page has its own return function
             * since ver6.2, will not change view if there is a mask layer
             */
            returnHandler: function() {
                // if (this.tokenInfoView && this.tokenInfoView.from) { //get from token param
                //     this.jump2TokenUrl(this.tokenInfoView.from);
                //     this.tokenInfoView = undefined; //clear ret page after used
                //     return true;
                // } else {
                //     if (this.retPage) { //get from retPage param
                //         this.getOriginalRetpage();
                //         this.back(this.retPage);
                //         this.retPage = undefined; //reset it after used, because view instance will keep the same even enter from deferent view source
                //     } else if (this.backToPage) { //get from sub view setting
                //         this.back(this.backToPage);
                //     } else if (this.refererPage) { //get from url
                //         //in hybrid, when back from login page, referpage is itselft
                //         if (this.refererPage != this.viewname) {
                //             this.back(this.refererPage);
                //         } else {
                //             this.back();
                //         }
                //     } else { //default
                //         this.back();
                //     }
                //     return true;
                // }

                pageManager.back();
                return true;
            },
            /**
             * @description if page is entered from chgpwd, call this returnHandlerChgPwd api.
             * compared with returnHandler, returnHandlerChgPwd will skip check of retPage/backToPage/refererPage, and exit wallet module directly
             */
            //returnHandlerChgPwd: function() {
            //    /* abstract function */
            //    if (this.tokenInfoView && this.tokenInfoView.from) {
            //        this.jump2TokenUrl(this.tokenInfoView.from);
            //        this.tokenInfoView = undefined; //clear ret page after used
            //        return true;
            //    } else {
            //        this.exitWalletModule();
            //        return true;
            //    }
            //},
            showWarning404_wallet: function(callback, msg) {
                var scope = this;
                this.loading.hide();
                //this.cmpBak = this.$el.find('.J_WalletContainer');
                this.cmpBak = this.$el.children();
                this.$el.html(warninghtml);
                if (msg) {
                    this.$el.find('.J_ErrorInf').text(msg);
                }
                this.$el.find('.cui-btns-retry').click(callback);

                this.turning();
            },
            _showing404: false,
            show404: function(callback, msg) {
                this._showing404 = true;
                //this.showWarning404(callback);  //framework 404 has some back history issue!
                this.showWarning404_wallet(callback, msg);
            },
            hideWarning404Wallet: function() {
                //this.$el.find('.head-warning').addClass('hidden');
                this.$el.html('');
                this.$el.append(this.cmpBak);
            },
            hide404: function() {
                if (this._showing404) {
                    this._showing404 = false;
                    this.hideWarning404Wallet();
                }
            },
            /**
             * @description this function provide some common functions which like 'clear button', 'number input maxlength'.
             */
            initCommonEvent: function(clearCallback) {
                //bind event that click clear icon will clean the input.
                var that = this;
                var $clear = this.$el.find('.J_ClearInput');
                var $input = $clear.parent().find('.J_Input');
                $clear.hide();
                $clear.on('click', function() {
                    $input.val('');
                    $clear.hide();
                    if (clearCallback) {
                        clearCallback.call(that);
                    }
                });
                $input.on('input', function() {
                    if ($input.val().length > 0) {
                        $clear.show();
                    } else {
                        $clear.hide();
                    }
                });

                //handle the problem that maxlength doesn't work in number type input
                this.$el.find('input[type="number"]').on('input', function(e) {
                    var $this = $(this);
                    var maxlength = parseInt($this.attr('maxlength'));
                    if (!maxlength) {
                        return;
                    }
                    var val = $this.tempValue = $this.val();
                    if (val.length >= maxlength) {
                        $this.val($this.tempValue.substr(0, maxlength));
                    }
                })
            },
            /**
             * @description if you have routeMapping key-value map in your child, you will get a forward function as follows
             *
             * @example
             *
             *    routeMapping: {
             *        'goNextPage': 'pageA!paraA',
             *        'goAnotherPage': 'pageB!paraB'
             *    }
             *
             *    will be:
             *
             *    goNextpage: funciton (){
             *        this.forward("pageA!paraA");
             *    },
             *    goAnotherPage: function (){
             *        this.forward("pageB!paraB");
             *    }
             */
            initRouteEvent: function() {
                var that = this;
                for (var key in this.routeMapping) {
                    this[key] = (function(_forward) {
                        return function() {
                            that.forward(_forward);
                        }
                    })(this.routeMapping[key])
                }
            }
        });
        /**
         * @description override extend function storage parent function into child then you can call it in child constructor
         *
         * @example
         *    var AbstractPageView = cPageView.extend({
         *        onCreate: function (){
         *            this.member = 1;
         *        }
         *    })
         *
         *    var ChildPageView = AbstractPageView.extend({
         *        onCreate: function (){
         *            this.inherited(arguments);
         *        }
         *    })
         *
         *    var c = new ChildPageView();
         *    assert (c.member == 1) // True
         */
        AbstractPageView.extend = AbstractPageView.prototype.extend = function() {
            var child = arguments[0];

            for (var key in child) {
                var parentMember = this.prototype[key];
                if (typeof child[key] == 'function' && parentMember && typeof parentMember == 'function') {
                    child[key]._inherited = parentMember;
                }
            }

            return cPageView.extend.apply(this, arguments);
        };

        /**
         * @description if use this function, you can't run it in 'strict' mode
         */
        AbstractPageView.prototype.inherited = function(args, newArgs) {
            if (args.callee._inherited) {
                return args.callee._inherited.apply(this, newArgs || args);
            }
        };

        return AbstractPageView;
    });