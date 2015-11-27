define(['CommonStore', 'WalletModel', 'WalletStore', 'WalletPageView', "text!autotogift_html", "Util", "cGuiderService"],
		function (CommonStore, M, S, WalletPageView, html, Util, cGuiderService) {
		    var userStore = CommonStore.UserStore.getInstance(); //用户信息
		    var exchangeMethodModel = M.ExchangeTicketMethodModel.getInstance();
		    var setExgMethodModel = M.SetExgMethodModel.getInstance();
		     var STRING = {
		            PAGE_TITLE: "兑换成礼品卡"
		        };
		    // 新的方法都继承于WalletPageView
		    var View = WalletPageView.extend({
		        tpl: html,
		        title:STRING.PAGE_TITLE,
		        backBtn: true,
		         homeBtn: false,
		         //backToPage: STRING.PAGE_TITLE,
		        exchangeMethodModel: exchangeMethodModel,
		        setExgMethodModel: setExgMethodModel,
		        render: function () {
		            // 因为HeaderView的存在，this.$el需要append不能用html，否则headerview会被冲掉
		            this.$el.append($(this.tpl));
		            this.els = {
		                'autoTab': this.$el.find('#exchange_auto'),
		                'autoList': this.$el.find("#exchange_auto_list"),
		                'autoExgBtn': this.$el.find("#exchange_auto_btn"),
		                'exgMethodStatus': this.$el.find("#exg_method_status")
		            }
		        },

		        events: {
		            'click #exchange_hand': 'switchTab',
		            'click #exg_method_status': 'switchAutoBtnStatus'
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
		             if (!Util.checkUser(this))
		                return;

		            this.getExgMethodFn();
		            this.turning();
		        },
		        returnHandler:function(){//TODO
		            this.hideWarning404();
		            var self = this;
		            self.hideLoading();
		            cGuiderService.apply({
		                hybridCallback: function () {
		                    var source = "useraccount";
		                    if (self.getQuery('source')) {
		                        source = decodeURIComponent(self.getQuery('source'));
		                    }
		                    if (source.indexOf("useraccount") > -1) {
		                        self.forward("useraccount" + (source ? "?source=" + encodeURIComponent(source) : ""));
		                    } else if (source.indexOf("todebitcard") > -1) {
		                        self.forward("todebitcard" + (source ? "?source=" + encodeURIComponent(source) : ""));
		                    } else {
		                        cGuiderService.backToLastPage();
		                    }
		                },
		                callback: function () {
		                    var source = "useraccount";
		                    if (self.getQuery('source')) {
		                        source = decodeURIComponent(self.getQuery('source'));
		                    }
		                    self.back(source);
		                }
		            });
		            return true;
		        },
		        switchTab: function (e) {
		            var self = this;
		            var source = "manualtogift";
		            if (self.getQuery('source')) {
		                source = decodeURIComponent(self.getQuery('source'));
		            }
		            this.forward("manualtogift" + (source ? "?source=" + encodeURIComponent(source) : ""));
		        },
		        onHide: function () {
		        	this.inherited(arguments);
		        },
		        switchAutoBtnStatus: function (e) {
		            //        	var ele = $(e.target).parent();

		            this.setExgMethodFn();
		            console.log("autoBtn");
		        },
		        setSuccFn: function () {
		            var self = this;
		            var ele = self.els.exgMethodStatus;
		            ele.toggleClass("open");
		            if (ele.hasClass("open")) {
		                $("#exg_auto_des").show();
		            } else {
		                $("#exg_auto_des").hide();
		            }
		        },
		        _GetExgMethSuc: function (data) {
		            var self = this;
		            self.hideLoading();
		            if (data && data.rc == 0) {
		                console.log(data);
		                if (data.exchgtype == 0) {
		                    if (self.els.exgMethodStatus.hasClass("open")) {
		                        self.els.exgMethodStatus.removeClass("open");
		                    }
		                } else if (data.exchgtype == 1) {
		                    if (!self.els.exgMethodStatus.hasClass("open")) {
		                        self.els.exgMethodStatus.addClass("open");
		                    }
		                }
		            } else {
		                self.onModelExecFail(data); //404
		            }
		        },
		        getExgMethodFn: function () {
		            var exgMethodModel = this.exchangeMethodModel;
		            var self = this;
		            self.showLoading();
		            exgMethodModel.exec({
		                suc: this._GetExgMethSuc,
		                scope: this,
		                fail: function () {
		                    self.hideLoading();
		                },
		                abort: function () {
		                    self.hideLoading();
		                }

		            });
		        },
		        _SetExgMethSuc: function (data) {
		            var self = this;
		            self.hideLoading();
		            if (data && data.rc == 0) {
		                console.log(data);
		                self.setSuccFn();
		            } else {
		                self.showToast(data.rmsg || "提交失败！请稍后再试", 1.2);
		            }
		        },
		        setExgMethodFn: function () {
		            var setExgModel = this.setExgMethodModel;
		            var succFn = succFn;
		            var self = this;
		            self.showLoading();
		            if (self.els.exgMethodStatus.hasClass("open")) {//有open表示处于自动状态
		                setExgModel.setParam("exchgtype", 0);
		            } else {
		                setExgModel.setParam("exchgtype", 1);
		            }
		            setExgModel.exec({
		                suc: this._SetExgMethSuc,
		                scope: this,
		                fail: function () {
		                    self.hideLoading();
		                },
		                abort: function () {
		                    self.hideLoading();
		                }
		            });
		        }
		    });
		    return View;

		});
