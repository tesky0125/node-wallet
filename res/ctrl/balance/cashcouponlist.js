/**
 * @author alivechen
 * @desc:  Wallet V6.6
 */

define(['Util', 'WalletListView', 'WalletModel', 'Config', 'text!cashcouponlist_html'],
	function(Util, WalletListView, WalletModel, Config, html) {

		var STRING = {
			PAGE_TITLE: "返现记录"
		};
		var cashAccountInfo = WalletModel.ReCashListModel.getInstance();
		var itemTemplate = '<ul class="fxbox">' +
			'<li>' +
			'<p class="fxname ellips_line3"><%=oname%></p>' +
			'<p class="txtgray">订单号：<%=oid%></p>' +
			'</li>' +
			'<li class="listprice">' +
			'<strong><dfn>&yen;</dfn><%=amt%></strong>' +
			'<p class="txtgray">返现日期：<%=date%></p>' +
			'</li>' +
			'</ul>';
		var View = WalletListView.extend({
			tpl: html,
			title: STRING.PAGE_TITLE,
			backBtn: true,
			homeBtn: false,
			//backToPage: 'useraccount',
			model: {},
			lastrfno: 1,
			events: {},
			itemTemplate: itemTemplate,
			firstLoadList: null,
			isCompleted: false,
			isLoading: false,
			onCreate: function() {
				console.log('onCreate');
				this._initModeData();
				this.inherited(arguments);

			},
			_initModeData: function() {
				this.lastrfno = 1;
				this.modelDataList = [];
			},
			resetList: function() {
				this._initModeData();
				this._gettingData = false;
				this.inherited(arguments);
			},
			onShow: function() {
			    this.inherited(arguments);

			    if (!Util.checkUser(this))
			        return;

				this.render();
			},

			onHide: function() {
				this.inherited(arguments);
				//to hide ctrip menu
			},
			onButtomPull: function(param, callback) {
				var self = this;
				cashAccountInfo.setParam("pageid",this.lastrfno)
				cashAccountInfo.setParam("reqbmp", 1);
				cashAccountInfo.exec({
					scope: this,
					suc: function(data) {
						if (data.rc == 0) {
							if (param.firstRequest && data.refundlist.length == 0) {
								if (self.refundNoData.css("display") == "none" || self.refundNoData.css("display") == undefined) {
									self.refundNoData.show();
								}
							}
							if (data.refundlist.length) {
								this.lastrfno =this.lastrfno+1;
								this.modelDataList = _.union(this.modelDataList, data.refundlist)
							}
							callback(data.refundlist);
						} else {

						}
					},
					fail: function(data) {
						this.onButtomPullExecFail(data, callback);
					}
				})
			},
			render: function() {
				this.$el.html(_.template(this.tpl));
				this.itemContainter = this.$el.find('#refund_list');
				this.moreDivParent = this.$el.find('.wrap');
				this.refundNoData = this.$el.find('#refund_list_no_data');
			}
		});
		return View;
	});