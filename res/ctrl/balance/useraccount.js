define(['CommonStore', 'cUtilHybrid', 'WalletModel', 'WalletStore', 'WalletPageView', 'text!useraccount_html', 'Util', "BalConfig", "Config", 'Message', "cGuiderService"],
	function(CommonStore, cUtilHybrid, M, S, WalletPageView, html, Util, BalConfig, Config, Message, cGuiderService) {
		var cashModel = M.ReCashListModel.getInstance(),
			balanceAdsModel = M.BalanceAdsModel.getInstance(),
			walletEntraModel = M.ExchangeTicketMethodModel.getInstance();
		var userStore = CommonStore.UserStore.getInstance(); //用户信息
		var scratchCardModel = M.ExgScratchCardModel.getInstance(); //刮刮卡活动
		var scthCardStore = S.ScratchCardStore.getInstance();
		var formPageStore = S.SetPageStore.getInstance();
		var walletUserInfo = M.WalletUserInfoSearch.getInstance(); //钱包用户信息， 是否实名

		var STRING = {
			PAGE_TITLE: '返现',
			FROZEN_TXT: '您的账户处于冻结状态，目前无法操作，如需帮助请联系携程客服。',
			AUTH_TXT: '转至现金余额需要先完成实名认证，是否立即进行实名认证？',
			NOPAYPSD_TXT: '您尚未设置支付密码，请先进行设置。',
			GO_AUTHENTICATE: '去认证',
			CONFIRM: '确定',
			CLOSE: '关闭',
			CONTACT: '致电客服',
			CENCLE: '取消'
		};

		var View = WalletPageView.extend({
			tpl: html,
			title: STRING.PAGE_TITLE,
			cashModel: cashModel,
			backBtn: true,
			homeBtn: false,
			//backToPage: 'index',
			balanceAdsModel: balanceAdsModel,
			scratchCardModel: scratchCardModel,
			walletEntraModel: walletEntraModel,
			scthCardStore: scthCardStore,
			balAdsUrl: "",
			eggCount: 0,
			render: function() {
				// 因为HeaderView的存在，this.$el需要append不能用html，否则headerview会被冲掉
				this.$el.append($(this.tpl));
				this.els = {
					'cashTab': this.$el.find('#cash_acct'),
					'cashList': this.$el.find('#cash_list'),
					'amount': this.$el.find('#js_bal_amount'),
					'li_exgScthCard': this.$el.find('#li_scthCard'),
					'exgScthCard': this.$el.find("#ExgScratchCard"),
					"walletEntra": this.$el.find("#switch_cash"),
					"ticketEntra": this.$el.find("#exchange_ticket"),
					"transferEntra": this.$el.find("#transfer_account"),
					"transferToCardEntra": this.$el.find("#transfer_tocard"),
					"exchgPhoneEntra": this.$el.find("#exchg_phone")
				}
			},
			events: {
				'click #cash_acct': 'chooseUserAcctTab',
				'click #coupon_acct': 'chooseCouponAcctTab',
				'click #refund_records': 'showRefundRecords',
				'click #payout_records': 'showPayoutRecords',
				'click #switch_cash': 'switchCashFn', //转到现金余额
				'click #transfer_account': 'showTransferAccount', //转账到储蓄卡
				'click #transfer_tocard': 'showTransferToCard', //转出到储蓄卡
				'click #exchange_ticket': 'showExchangeTicket', //兑换礼品卡
				'click #li_scthCard': 'showScthCard', //刮刮卡活动
				//'click #cash_rule': 'showCashRule', //返现规则说明
				'click #J_balAds': 'toBalAds', //广告
				'click .J_ShowVersion': function() {
					this.eggCount++;
					if (this.eggCount >= 10) {
						this.eggCount = 0;
						this.showMessage(Config.VER);
					}
				},
				'click #exchg_phone': 'toExchgPhoneFn'
			},

			toBalAds: function() {
				var linkUrl = this.balAdsUrl;
				if (linkUrl) {
					//		                cGuiderService.jump({ targetModel: 'h5', url: linkUrl });
					location.href = linkUrl;
				}
			},
			onCreate: function() {
				this.inherited(arguments);
				//this.injectHeaderView();
				this.render();
			},
			onShow: function() {
				this.inherited(arguments);
				if (!Util.checkUser(this))
					return;
				this.getCashSer();
			},
			checkUserFrozen: function(user) {
				var frozen = user.userstatus === 2;
				frozen && this.showAlert({
					msg: STRING.FROZEN_TXT,
					cTxt: STRING.CONFIRM
				});
				return frozen;
			},
			noPaymentPassword: function(user) {
				var self = this;
				var nopsd = user.haspwd != 1;
				nopsd && this.showGoSetAlert({
					msg: STRING.NOPAYPSD_TXT,
					setFn: function() {
						self.goSetPwdFn();
					}
				});
				return nopsd;
			},
			execWalletUserInfo: function(sucFn, failFn, abortFn) {
				var self = this;
				this.showLoading();
				walletUserInfo.param = {
					reqbmp: 3
				};
				walletUserInfo.exec({
					scope: this,
					suc: function(data) {
						self.hideLoading();
						sucFn && sucFn.call(self, data);
					},
					fail: function(data) {
						self.hideLoading();
						failFn && failFn.call(self, data);
					},
					abort: function(data) {
						self.hideLoading();
						abortFn && abortFn.call(self, data);
					}
				});
			},
			goSetPwdFn: function() {
				this.forward('setpaypsd2')
			},
			switchCashFn: function(e) { //转到现金余额
				this.execWalletUserInfo(this._toSwitchCash);
			},
			showTransferAccount: function(e) { //转账到储蓄卡
				this.execWalletUserInfo(this._toTransferAccount);
			},
			showTransferToCard: function(e) { //转出到储蓄卡
				this.execWalletUserInfo(this._toTransferCard);
			},
			showExchangeTicket: function(e) { //兑换礼品卡
				this.execWalletUserInfo(this._toExchangeTicket);
			},
			showScthCard: function() { //刮刮卡活动
				this.execWalletUserInfo(this._toScrathCard);
			},
			toExchgPhoneFn: function() { //兑换手机话费
				this.execWalletUserInfo(this._toExchgPhone);
			},
			_toSwitchCash: function(data) {
				console.log("to switch cash");
				var self = this;
				if (!(walletUserInfo.hasPwdData() && walletUserInfo.hasUserData())) {
					self.showToast(Message.get(123));
					return;
				}
				//账户是否冻结
				if (data.userstatus == 2) {
					this.showGoSetAlert({
						msg: STRING.FROZEN_TXT,
						cTxt: STRING.CLOSE,
						sTxt: STRING.CONTACT,
						setFn: function() {
							Util.callPhone(BalConfig.SERVICE_TEL_NUMBER);
						}
					});
					return;
				}
				if (this.noPaymentPassword(data)) {
					return;
				}
				if (data.authstatus == 1 || data.authstatus == 100 || data.authstatus == 3) {
					this.forward("switchcash");
				} else {
					this.showDlg({
						message: STRING.AUTH_TXT,
						buttons: [{
							text: STRING.CENCLE,
							type: "cancel",
							click: function() {
								this.hide();
							}
						}, {
							text: STRING.GO_AUTHENTICATE,
							click: function() {
								this.hide();
								formPageStore.setAttr('rmFromPage', 'useraccount')
								self.forward('accountverified');
							}
						}]
					});
				}

			},
			_toTransferAccount: function(data) {
				console.log("to transfer account");
				var self = this;
				if (!(walletUserInfo.hasPwdData() && walletUserInfo.hasUserData())) {
					self.showToast(Message.get(123));
					return;
				}
				if (this.checkUserFrozen(data)) {
					return;
				}
				if (this.noPaymentPassword(data)) {
					return;
				}
				self.forward('todebitcard?' + this.getSourceUrl());
			},
			_toTransferCard: function(data) {
				console.log("to transfer card");
				var self = this;
				if (!(walletUserInfo.hasPwdData() && walletUserInfo.hasUserData())) {
					self.showToast(Message.get(123));
					return;
				}
				if (this.checkUserFrozen(data)) {
					return;
				}
				if (this.noPaymentPassword(data)) {
					return;
				}
				this.forward("withdraw?path=transfer");
			},
			_toExchangeTicket: function(data) {
				console.log("to exchange ticket");
				var self = this;
				if (!(walletUserInfo.hasPwdData() && walletUserInfo.hasUserData())) {
					self.showToast(Message.get(123));
					return;
				}
				if (this.checkUserFrozen(data)) {
					return;
				}
				self.forward('manualtogift?' + self.getSourceUrl());
			},
			_toScrathCard: function(data) {
				console.log("to scratch ticket");
				var self = this;
				if (!(walletUserInfo.hasPwdData() && walletUserInfo.hasUserData())) {
					self.showToast(Message.get(123));
					return;
				}
				if (this.checkUserFrozen(data)) {
					return;
				}
				var _scthCardStore = this.scthCardStore;
				var H5Url = "";
				H5Url = _scthCardStore.getAttr("HybridUrl");
				if (H5Url && /^http[s]*/gi.test(H5Url)) {
					// cGuiderService.jump({ targetModel: 'h5', url: H5Url });
					location.href = H5Url;
				}
			},
			_toExchgPhone: function(data) {
				console.log("to exchgphone");
				var self = this;
				if (!(walletUserInfo.hasPwdData() && walletUserInfo.hasUserData())) {
					self.showToast(Message.get(123));
					return;
				}
				if (this.checkUserFrozen(data)) { //账户是否冻结
					return;
				}

				if (this.noPaymentPassword(data)) {
					return;
				}
				this.forward('exchgphone');
			},
			showAlert: function(params) { //msg, cTxt:第一个按钮文字
				this.showDlg({
					message: params.msg,
					buttons: [{
						text: params.cTxt || STRING.CONFIRM,
						type: "cancel",
						click: function() {
							this.hide();
						}
					}]
				});
			},
			showGoSetAlert: function(params) { //msg, cTxt:第一个按钮文字, sTxt：第二个按钮文字
				this.showDlg({
					message: params.msg,
					buttons: [{
						text: params.cTxt || "取消",
						type: "cancel",
						click: function() {
							this.hide();
						}
					}, {
						text: params.sTxt || "去设置",
						click: function() {
							this.hide();
							params.setFn && params.setFn();
						}
					}]
				});
			},

			getEntraFlag: function(value) {
				var result = "",
					flag = value,
					nativePageParam = this.getQuery("from_native_page");
				if (flag) {
					if (flag.indexOf("cash-inner") > -1) {
						result = "cash-inner";
					} else if (flag.indexOf("cash") > -1) {
						result = "cash";
					}
				}

				return result;
			},
			getCashSer: function() {
				var self = this;
				self.requestCashSer();
			},
			requestCashSer: function() {
				var self = this;
				/*
				 * 外链cash 与 coupon
				 * 内链cash-inner 与 coupon-inner
				 */
				//设置现金账户flag
				cashModel.setParam("reqbmp", 4);
				cashModel.setParam("pageid", 1);
				this.showLoading();
				cashModel.exec({
					suc: this._getReCashListSuc,
					scope: this,
					fail: function(data) {
						self.onModelExecFail(data); //404
					},
					abort: function(data) {
						self.onModelExecFail(data); //404
					}
				});
			},
			_getReCashListSuc: function(data) { //返现记录成功回调
				var self = this;
				self.hideLoading();
				console.log(data);
				if (data && data.rc == 0) {
					self.cashamt = data.cashamt;
					//self.els.amount.text("¥" + self.cashamt);
					self.els.amount.text(self.cashamt);

					self.getWalletEntra(); //获取入口
					if (Config.IS_INAPP) { //
						self.getScthCard(self.scratchCardModel); //刮刮卡活动
						if (cUtilHybrid.getAppSys() != "pro") {
							self.getBalanceAds(self.balanceAdsModel); //广告
						}
					}
				} else {
					self.onModelExecFail(data); //404
				}
			},
			getWalletEntra: function() {
				var self = this;
				var model = this.walletEntraModel;
				model.exec({
					suc: this._getWalletEntraSuc,
					scope: this,
					fail: function() {
						self.hideLoading();
					},
					abort: function() {
						self.hideLoading();
					}
				});
			},
			_addBl: function() {
				//var $items = $($(".J_FL li").get().reverse());
				var $items = $($(this.$el.find(".J_FL li")).get().reverse());

				var got = false;
				$items.each(function() {
					if ($(this).css("display") != "none") {
						if (!got) {
							$(this).addClass("cash_bl");
							got = true;
						}else{
							$(this).removeClass("cash_bl");
						}
					}
				});
			},
			_getWalletEntraSuc: function(data) {
				var self = this;
				if (data && data.rc == 0) {
					self.hideAllEntra(); //隐藏所有的入口
					var arr = data.waylist || [];
					_.each(arr, function(item) {
						var waytype = item.waytype;
						switch (waytype) {
							case 1:
								self.els.ticketEntra.show();
								break;
							case 2:
								self.els.transferEntra.show();
								break;
							case 3:
								break;
							case 4:
								self.els.walletEntra.show();
								break;
							case 5:
								self.els.transferToCardEntra.show();
								break;
							case 6:
								self.els.exchgPhoneEntra.show();
								break;
							default:
								break;
						}
					});
				}
				this._addBl();
			},
			hideAllEntra: function() {
				var self = this;
				self.els.ticketEntra.hide();
				self.els.transferEntra.hide();
				self.els.walletEntra.hide();
				self.els.transferToCardEntra.hide(); //转出到储蓄卡
				self.els.exchgPhoneEntra.hide();
			},
			chooseCouponAcctTab: function() {
				if (Config.IS_INAPP) { //
					cGuiderService.cross({
						path: 'ifinance/balance',
						param: "index.html#couponaccount"
					});
				} else {
					this.jump("http://" + BalConfig.DOMAIN_HOME_ARR[BalConfig.ENV] + "/webapp/ifinance/balance/index.html#couponaccount");
				}
				//            this.forward('balance/couponaccount');
			},
			onHide: function() {
				this.inherited(arguments);
				if (this.alert) {
					this.alert.hide();
				}
			},
			// returnHandler:function(){
			// 	this.hideWarning404();
			// 	var self = this;
			// 	self.hideLoading();

			// 	if (this.tokenInfoView && this.tokenInfoView.from) { //get from token param
			// 		this.jump2TokenUrl(this.tokenInfoView.from);
			// 		this.tokenInfoView = undefined; //clear ret page after used
			// 	} else {
			// 		if (!!this.retPage) {
			// 			Lizard.goBack(this.retPage, {
			// 				viewName: this.retPage
			// 			});
			// 		} else {
			// 			var tk = Util.getTokenInfoStore();
			// 			if (tk && tk.from && tk.entryLast == 'useraccount') {
			// 				this.jump2TokenUrl(tk.from);
			// 			} else {
			// 				if(Config.IS_INAPP) {
			// 					this.back();//TODO: wallet -> useraccount -> couponaccount -> back -> back: not back to wallet!
			// 			    } else {
			// 				    Lizard.goBack("index", {
			// 					    viewName: "index"
			// 				    });
			// 			    }
			// 			}
			// 		}
			// 	}
			// },
			showRefundRecords: function(e) { //返现记录
				this.forward('cashcouponlist');
			},
			showPayoutRecords: function(e) { //提现记录
				this.forward('payoutlist')
					//this.forward('payoutlist');
			},
			getSourceUrl: function() {
				var link = "source=" + encodeURIComponent('useraccount');
				return link;
			},
			getScthCard: function(model) { //刮刮卡
				var self = this;
				var scthCardModel = model;
				scthCardModel.excute(function(data) {
					if (data.ResultCode == 0) {
						self.els.exgScthCard.text(data.Name);
						self.els.li_exgScthCard.show();
						self._addBl();
					} else if (data.ResultCode == 1) {
						self.els.li_exgScthCard.hide();
						self.els.exgScthCard.text(data.Name);
					}
				}, function() { //error
					self.els.li_exgScthCard.hide();
				}, true, scthCardModel, function() { //abort
					self.els.li_exgScthCard.hide();
				});
			},
			getBalanceAds: function(model) {
				var self = this,
					balModel = model;
				var deviceInfo = JSON.parse(window.localStorage.getItem("CINFO"));
				var sourceId = deviceInfo && deviceInfo.sourceId;
				balModel.setParam("ChannelID", sourceId || "0");

				balModel.setParam("DeviceInfo", {
					ScreenWidth: deviceInfo.screenWidth,
					ScreenHeight: deviceInfo.screenHeight,
					DeviceOSVersion: deviceInfo.deviceOSVersion,
					ScreenPxDensity: deviceInfo.screenPxDensity
				});

				balModel.setParam("SystemCode", deviceInfo.systemCode);
				balModel.excute(function(data) { //success callback
					var adsList = data.Ads;
					var imgUrl = adsList && adsList[0] && adsList[0].ADContentLists && adsList[0].ADContentLists.SrcUrl;
					var trackUrl = adsList && adsList[0] && adsList[0].ADContentLists && adsList[0].ADContentLists.LinkUrl;
					if (data.Result && data.Result.ResultCode == 0) {
						self.$el.find("#balanceAds").html('<span id="J_balAds" ><img style="width:100%;float:left;" src="' + imgUrl + '"></span>');
						self.$el.find("#balanceAds img").bind("load", function() {
							self.$el.find("#balanceAds").show();
						});
						self.$el.find("#balanceAds img").bind("error", function() {
							self.$el.find("#balanceAds").hide();
						});
						self.balAdsUrl = trackUrl;
					} else {
						self.$el.find("#balanceAds").hide();
					}
				}, function(error) { //error
					self.$el.find("#balanceAds").hide();
				}, true, balModel, function() {
					self.$el.find("#balanceAds").hide();
				});
			}
		});
		return View;

	});