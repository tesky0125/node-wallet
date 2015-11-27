define(['cLocalStorage', 'cUtilDate', 'CommonStore', 'WalletModel', 'WalletStore', 'WalletPageView', "text!manualtogift_html", "Util", "cGuiderService", "CacheData"],
		function (cLocalStorage, cUtilDate, CommonStore, M, S, WalletPageView, html, Util, cGuiderService, CacheData) {
		    ///var cBase = c.base, cStorage = c.storage;
		    var cObj = {
		        ///cStorage: c.storage,
		        cStorage: cLocalStorage,
		        ///cDate: cBase.Date
		        cDate: cUtilDate
		    };
		     var STRING = {
		            PAGE_TITLE: "兑换成礼品卡"
		        };
		    var cashModel = M.ReCashListModel.getInstance();
		    var cashStore = S.ReCashListStore.getInstance();//提现记录store
		    var manualExgModel = M.ExgOrGainModel.getInstance();
		    var _transferStore = S.TransferStore.getInstance();
		    var _exgMethodModel = M.ExchangeTicketMethodModel.getInstance();
		    var userStore = CommonStore.UserStore.getInstance(); //用户信息
		    // 新的方法都继承于WalletPageView
		    var View = WalletPageView.extend({
		        tpl: html,
		        
		        _cObj: cObj,
		        title:STRING.PAGE_TITLE,
		         backBtn: true,
		         homeBtn: false,
		         //backToPage: 'useraccount',
		        cashStore: cashStore,
		        cashModel: cashModel,
		        exgTkType: 2,//任我游
		        manualExgModel: manualExgModel,
		        exgMethodModel: _exgMethodModel,
		        transCardStore: _transferStore, //储蓄卡相关信息
		        exgRuleFlag: true,  //默认兑换规则执行
		        render: function () {
		            // 因为HeaderView的存在，this.$el需要append不能用html，否则headerview会被冲掉
		            this.$el.append($(this.tpl));
		            this.els = {
		                'handTab': this.$el.find('#exchange_hand'),
		                'autoTab': this.$el.find('#exchange_auto'),
		                'handList': this.$el.find("#exchange_hand_list"),
		                'ticketAmt': this.$el.find("#travel_ticket_amt"),
		                'exgAmout': this.$el.find("#exgAmout"),
		                'selfTravel': this.$el.find("#self_travel"), //任我游
		                'selfWalk': this.$el.find("#self_walk"),
		                'leftCashAmt': this.$el.find("#left_cash_amt"),
		                'ticketAmtNum': this.$el.find("#ticket_amt"),
		                'liExgAmt': this.$el.find("#li_exg_amt"),
		                'ulExgMeth': this.$el.find("#ul_exg_meth"),
		                'exgRuleCont': this.$el.find("#exg_rule_cont"),
		                'exgRuleText': this.$el.find("#exg_rule_text")
		            }
		        },

		        events: {
		            'click #exchange_auto': 'switchTab',
		            'blur #exgAmout': 'blurStatusFn',   //输入金额框失去焦点
		            'focus #exgAmout': 'activeStatusFn',  //激活状态
		            'input #exgAmout': 'inputNumFn',        //输入数值
		            'click .smalltab span': 'switchSmallTab',
		            'click #validateBtn': 'validateDataFn',
		            'click #exchange_auto_btn': 'switchAutoBtnStatus',
		            'click #travel_ticket_intro': 'showTicketIntro'
		        },

		        onCreate: function () {
		        	this.inherited(arguments);
		            //this.injectHeaderView();
		            this.render();

		            //var self = this;
		            //this.registerCallback(function(){
		            //    self.onShow();
		            //});
		        },

		        onShow: function () {
		        	this.inherited(arguments);
		        	var self = this;
		            //this.hybridBridgeRender();
		        	//add check before request.
		            if (!Util.checkUser(this))
		                return;
		        	
		            //初始化风控id
		            var cDate = self._cObj.cDate;

		            /*if (self.getEntryFn() == 2) {//从储蓄卡进入
		                if (self.transCardStore.getAttr("amount")) {
		                    self._cObj.cStorage.localStorage.set("_MANUALTICKETAMT", this.checkZeroFn(self.transCardStore.getAttr("amount").toString().trim()), new cDate().addDay(1));
		                }
		            }*/
		            this.setSavedExgAmt();
		            this.getUserCashAmt();//获取现金金额
		            ///this.initCfmAlert(); //6.6 wxm marked, garbage api
		            this.turning();
		        	console.log("show");
		        	var ticketAmt = this._cObj.cStorage.localStorage.get("_MANUALTICKETAMT");
		        	if (ticketAmt) {
		        	    self.activeStatusFn();
		        	}
		        },
		        returnHandler:function(){//TODO
					this.hideWarning404();
		            var self = this;
		            self.hideLoading();
		            cGuiderService.apply({
		                hybridCallback: function () {
		                    self._cObj.cStorage.localStorage.remove("_MANUALTICKETAMT");
		                    self._cObj.cStorage.localStorage.remove("_MANUALTICKETSHOWAMT");
		                    self._cObj.cStorage.localStorage.remove("_EXGTIKTYPE");
		                    self.clearPageData();
		                    var source = "";
		                    if (self.getQuery('source')) {
		                        source = decodeURIComponent(self.getQuery('source'));
		                    } else {
		                        if (self._cObj.cStorage.localStorage.get("_MANUALEXGSRC")) {
		                            source = self._cObj.cStorage.localStorage.get("_MANUALEXGSRC");
		                            self._cObj.cStorage.localStorage.remove("_MANUALEXGSRC");
		                        } else {
		                            self.showToast("页面超时", 1.2, function () {
		                                self.forward("useraccount");
		                            });
		                            return;
		                        }
		                    }
		                    if (source.indexOf("useraccount") > -1) {
		                        self.forward("useraccount");
		                    } else if (source.indexOf("todebitcard") > -1) {
		                        self.forward("todebitcard");
		                    }
		                },
		                callback: function () {
		                    var source = "useraccount";
		                    if (self.getQuery('source')) {
		                        source = decodeURIComponent(self.getQuery('source'));
		                    }
		                    self._cObj.cStorage.localStorage.remove("_MANUALTICKETAMT");
		                    self.clearPageData();
		                    self.back(source);
		                }
		            });
		            return true;
		        },
		        switchTab: function (e) {
		            var self = this;
		            var cDate = this._cObj.cDate;
		            this._cObj.cStorage.localStorage.set("_MANUALTICKETAMT", this.checkZeroFn(this.els.exgAmout.val().trim()), new cDate().addDay(1)); //存入兑换金额
		            var source = "useraccount";
		            if (this.getQuery('source')) {
		                source = decodeURIComponent(this.getQuery('source'));
		            } else {
		                if (self._cObj.cStorage.localStorage.get("_MANUALEXGSRC")) {
		                    source = self._cObj.cStorage.localStorage.get("_MANUALEXGSRC");
		                    self._cObj.cStorage.localStorage.remove("_MANUALEXGSRC");
		                } else {
		                    self.showToast("页面超时", 1.2, function () {
		                        self.forward("useraccount");
		                    });
		                    return;
		                }
		            }
		            this.forward("autotogift" + (source ? "?source=" + encodeURIComponent(source) : ""));
		        },
		        onHide: function () {
		        	this.inherited(arguments);
		        	this.els.exgAmout.removeClass("cui-input-error");
		        	this.els.exgAmout.val('');
		        	this.els.ticketAmtNum.html('');
		        },
		        showTicketIntro: function (e) {//礼品卡说明
		            var self = this;
		            var cDate = this._cObj.cDate;
		            this._cObj.cStorage.localStorage.set("_MANUALTICKETAMT", this.checkZeroFn(this.els.exgAmout.val().trim()), new cDate().addDay(1)); //存入兑换金额
		            var source = "";
		            if (self.getQuery('source')) {
		                source = decodeURIComponent(self.getQuery('source'));
		            }
		            this._cObj.cStorage.localStorage.set("_MANUALEXGSRC", source, new cDate().addDay(1));
		            cGuiderService.jump({ targetModel: 'h5', url: 'http://m.ctrip.com/html5/market/helplist.html#cticket', title: '常见问题' });

		        },
		        clearPageData: function () {
		            var self = this;
		            self.els.exgAmout.val("");
		            if (!self.els.liExgAmt.hasClass("bmnone")) {
		                self.els.liExgAmt.addClass("bmnone");
		            }
		            self.els.ticketAmtNum.html(0);
		            self.els.ticketAmt.hide();
		        },
		        activeStatusFn: function (e) {//兑换金额激活状态
		            if (this.els.liExgAmt.hasClass("bmnone")) {
		                this.els.liExgAmt.removeClass("bmnone");
		            }
		            this.els.ticketAmt.show();
		        },
		        showInputErr: function () {
		            this.els.exgAmout.focus();
		            this.els.exgAmout.addClass("cui-input-error");
		        },
		        inputNumFn: function (e) {//输入金额
		            if (this.els.exgAmout.hasClass("cui-input-error")) {
		                this.els.exgAmout.removeClass("cui-input-error");
		            }
		            var value = $(e.target).val().trim(), amtNum = 0;
		            if (!/\D/gi.test(value)) {//判断是否数字
		                if (this.els.selfTravel.hasClass("current")) {
		                    amtNum = this.exchangeAmtFn(value, 10);
		                    this.els.ticketAmtNum.html(amtNum);
		                } else {
		                    amtNum = this.exchangeAmtFn(value, 5);
		                    this.els.ticketAmtNum.html(amtNum);
		                }
		            }
		        },
		        blurStatusFn: function (e) {//输入框失去焦点
		            var tempValue = $(e.target).val();
		            if (!tempValue) {
		                if (!this.els.liExgAmt.hasClass("bmnone")) {
		                    this.els.liExgAmt.addClass("bmnone");
		                }
		                this.els.ticketAmt.hide();
		            }
		            //        	console.log("失去焦点");
		            $(window).scrollTop(0);
		        },
		        switchSmallTab: function (e) {
		            var d = $(e.target), amtNum = 0;
		            d.addClass("current");
		            if (d.attr("id") == "self_travel") {//任我游
		                this.els.selfWalk.removeClass("current");
		                amtNum = this.exchangeAmtFn(this.els.exgAmout.val(), 10);
		                this.els.ticketAmtNum.html(amtNum);
		            } else if (d.attr("id") == "self_walk") {
		                this.els.selfTravel.removeClass("current");
		                amtNum = this.exchangeAmtFn(this.els.exgAmout.val(), 5);
		                this.els.ticketAmtNum.html(amtNum);
		            }
		        },
		        checkZeroFn: function (num) {
		            var arr = num.split(""), index = -1;
		            for (var i = 0; i < arr.length; i++) {
		                if (arr[i] != 0) {
		                    index = i;
		                    break;
		                }
		            }
		            if (index == -1) {
		                return 0;
		            } else if (index >= 0) {
		                return arr.slice(index).join("");
		            }
		        },
		        validateDataFn: function (e) {//验证规则
		            var self = this;
		            var amt = this.els.exgAmout.val(), cashAmt = 0;
		            if (!amt) {
		                this.showToast("请填写兑换金额", 1.2, function () {
		                    self.showInputErr();
		                });
		            } else {
		                if (/^\s+$/gi.test(amt)) {//填写的只是空格
		                    this.showToast("请填写兑换金额", 1.2, function () {
		                        self.showInputErr();
		                    });
		                } else {//不全是空格
		                    if (typeof amt == "string") {
		                        amt = amt.trim();
		                    }
		                    amt = this.checkZeroFn(amt);
		                    if (/\D/gi.test(amt)) {//判断是否是数字
		                        if (/^\-\d+/gi.test(amt)) {//负数判断
		                            this.showToast("兑换金额不能小于1元", 1.2, function () {
		                                self.showInputErr();
		                            });
		                        } else {
		                            this.showToast("兑换金额请填写整数", 1.2, function () {
		                                self.showInputErr();
		                            });
		                        }
		                    } else {//是数字
		                        amt = parseInt(amt);
		                        cashAmt = parseInt(this.els.leftCashAmt.text());
		                        if (amt === 0) {
		                            this.showToast("兑换金额不能小于1元", 1.2, function () {
		                                self.showInputErr();
		                            });
		                        } else if (amt > cashAmt) {
		                            this.showToast("返现账户余额不足", 1.2, function () {
		                                self.showInputErr();
		                            });
		                        } else {//验证通过
		                            this.submitManualExgFn(amt);
		                        }
		                    }
		                }
		            }
		            console.log("amt: " + amt);
		        },
		        switchAutoBtnStatus: function (e) {
		            var ele = $(e.target).parent();
		            ele.toggleClass("open");
		            if (ele.hasClass("open")) {
		                $("#exg_auto_des").show();
		            } else {
		                $("#exg_auto_des").hide();
		            }
		            console.log("autoBtn");
		        },
		        _CashListSuc: function (data) {
		            var self = this;
		            if (data && data.rc == 0) {
		                this.els.leftCashAmt.html((data.cashamt || data.cashamt == 0) ? data.cashamt : "");
		                this.exgMethodModel.exec({
		                    suc: this._ExgMethSuc,
		                    scope: this,
		                    fail: function () {
		                        self.hideLoading();
		                    },
		                    abort: function () {
		                        self.hideLoading();
		                    }
		                });
		            }
		        },
		        _ExgMethSuc: function (data) {
		            var self = this;
		            var exgMethInfo = null;
		            if (data && data.rc == 0) {
		                self.hideLoading();
		                exgMethInfo = self.getExgMethInfo(data.waylist);
		                if (exgMethInfo) {
		                    if (typeof exgMethInfo.wayremark == "string" && exgMethInfo.wayremark.trim()) {
		                        self.els.exgRuleCont.html(exgMethInfo.wayremark);
		                        self.els.exgRuleText.show();
		                    } else {
		                        self.exgRuleFlag = false; //不执行兑换规则
		                        self.setSavedExgAmt();
		                    }
		                } else {
		                    self.exgRuleFlag = false; //不执行兑换规则
		                    self.setSavedExgAmt();
		                }
		            }
		        },
		        getUserCashAmt: function () {//获取用户现金账户金额 和兑换方式信息
		            var self = this;
		            self.showLoading();
		            this.cashModel.setParam("reqbmp", 4);
		            this.cashModel.exec({
		                suc: this._CashListSuc,
		                scope: this,
		                fail: function () {
		                    self.showErrMsg();
		                },
		                abort: function () {
		                    self.showErrMsg();
		                }
		            });
		        },
		        getEntryFn: function () {//获得入口
		            var entryFlag = this.getQuery("entry"), result = 1;
		            if (entryFlag) {
		                if (entryFlag == "card") {
		                    result = 2;
		                } else if (entryFlag == "ticket") {
		                    result = 1;
		                }
		            } else {
		                result = 0;
		            }

		            return result;
		        },
		        showErrorMessage: function () {//加载失败，显示404
		            var self = this;
		            self.showWarning404(function () {
		                self.hideWarning404();
		                self.showView();
		            });
		        },
		        setSavedExgAmt: function () {//设置已经储存的兑换金额
		            var self = this;
		            //获取存储的兑换金额
		            var ticketAmt = self._cObj.cStorage.localStorage.get("_MANUALTICKETAMT");
		            console.log("amt: " + ticketAmt);
		            if (ticketAmt) {
		                self.els.exgAmout.val(ticketAmt);
		                if (ticketAmt !== "0") {//计算兑换礼品卡
		                    if (self.els.selfTravel.hasClass("current")) {
		                        self.els.ticketAmtNum.html(self.exchangeAmtFn(ticketAmt, 10));
		                    } else {
		                        self.els.ticketAmtNum.html(self.exchangeAmtFn(ticketAmt, 5));
		                    }
		                }
		            } else {
		                self.clearPageData();
		            }
		        },
		        getExgMethInfo: function (arr) {
		            var exgMethInfo = null;
		            for (var i = 0; i < arr.length; i++) {
		                if (arr[i].waytype == 1) {
		                    exgMethInfo = arr[i];
		                }
		            }
		            return exgMethInfo;
		        },
		        exchangeAmtFn: function (rawValue, num) {
		            var amtNum = 0, value = "";
		            if (typeof rawValue == "string") {
		                value = rawValue.trim();
		            } else if (typeof rawValue == "number") {
		                value = rawValue;
		            }
		            value = isNaN(parseInt(value)) ? 0 : parseInt(value);
		            if (this.exgRuleFlag) {
		                amtNum = Math.floor(value / 100) * num + value;
		            } else {
		                amtNum = value;
		            }
		            return amtNum;
		        },
		        _ManualExgSuc: function (data) {
		            var self = this;
		            self.hideLoading();
		            if (data) {
		                console.log(data);
		                if (data.rc == 0) {
		                    //self.showMessage("成功提交礼品卡兑换申请！实际兑换金额￥" + self.getExgedAmt() + "，将在当日内转入您的礼品卡账户。");
		                    self.showDlg({//兑换成功操作
		                        title: '',
		                        message: "成功提交礼品卡兑换申请！实际兑换金额￥" + self.getExgedAmt() + "，将在当日内转入您的礼品卡账户。",
		                        buttons: [{
		                            text: '确认',
		                            ///type: c.ui.Alert.STYLE_CANCEL,
		                            click: function () {
		                                this.hide();
		                                self._cObj.cStorage.localStorage.set("_MANUALTICKETAMT", "");
		                                self._cObj.cStorage.localStorage.set("_EXGTIKTYPE", "");
		                                //CacheData.setIsRecashReloaded(true);
		                                //location.reload();//TODO: it will clear url params...
		                                self.onShow();
		                            }
		                        }, {
		                            text: '查看兑换记录',
		                            click: function (e) {
		                                this.hide();
		                                //    					self.cashStore.remove();
		                                self.forward("payoutlist?flag=new");
		                            }
		                        }
		                        ]
		                    });
		                } else if (data.rc == 1302052) {//走风控  弹出alert
		                    self.showDlg({//兑换成功操作
		                        title: '',
		                        message: data.rmsg || "返现余额无法兑换礼品卡！",
		                        buttons: [{
		                            text: '确认',
		                            ///type: c.ui.Alert.STYLE_CANCEL,
		                            click: function () {
		                                this.hide();
		                            }
		                        }]
		                    });
		                } else {
		                    self.showToast(data.rmsg || "提交失败！请稍后再试", 2, function () {
		                        self.showInputErr();
		                    });
		                }
		            } else {
		                self.showToast("提交失败！请稍后再试", 2);
		            }
		        },
		        submitManualExgFn: function (amt) {//提交手工兑换
		            var self = this;
		            var model = this.manualExgModel;
		            model.setParam("waytype", 1);
		            model.setParam("amount", this.els.exgAmout.val());
		            model.setParam("bankid", 0);
		            model.setParam("bankname", "");
		            model.setParam("cardno", "");
		            model.setParam("idtype", 0);
		            model.setParam("idno", "");
		            model.setParam("holder", "");
		            model.setParam("prvid", 0);
		            model.setParam("prvname", "");
		            model.setParam("cityid", 0);
		            model.setParam("cityname", "");
		            if (this.els.selfTravel.hasClass("current")) {
		                model.setParam("tktype", 2);//任我游
		            } else {
		                model.setParam("tktype", 1);//任我行
		                this.exgTkType = 1;
		            }
		            model.setParam("vercode", "");
		            model.setParam("paypwd", "");
		            model.setParam("riskid", "");
		            this.showLoading();
		            model.exec({
		                suc: this._ManualExgSuc,
		                scope: this,
		                fail: function () {
		                    self.hideLoading();
		                },
		                abort: function () {
		                    self.hideLoading();
		                }
		            });
		        },
		        getExgedAmt: function () {
		            var self = this;
		            var exgAmt = 0;
		            if (self.els.selfTravel.hasClass("current")) {
		                exgAmt = self.exchangeAmtFn(self.checkZeroFn(self.els.exgAmout.val().trim()), 10);
		            } else if (self.els.selfWalk.hasClass("current")) {
		                exgAmt = self.exchangeAmtFn(self.checkZeroFn(self.els.exgAmout.val().trim()), 5);
		            }
		            return exgAmt;
		        }
		    });
		    return View;

		});
