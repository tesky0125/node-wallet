/**
 * @author alivechen
 * @desc:  Wallet V6.6
 */

define(['Util', 'WalletListView', 'WalletModel', 'Config', 'text!payoutlist_html'],
	function(Util, WalletListView, WalletModel, Config, html) {

		var STRING = {
			PAGE_TITLE: "转出记录"
		};
		var cashAccountInfo = WalletModel.ReCashListModel.getInstance();
		var itemTemplate = '<li>' +
			'<span><%= date%></span><span><%=name%></span><span><dfn>&#165; </dfn><%=amt%></span>' +
			'<div class="font12 <%=status=="失败"? "erro":""%>"><span></span><font class="grey"><%=account%></font><i class="fr"><%=status%><%if(status=="失败"&&errcode!=""){%>(<%=errcode%>)<%};%></i></div>' +
			'<%if(status=="失败"&&errmsg!=""){%>' +
			'<div class="t_r"><i class="outRecorderro"><%=errmsg%></i></div>' +
			'<%};%>' +
			'</li>';
		var View = WalletListView.extend({
			tpl: html,
			title: STRING.PAGE_TITLE,
			backBtn: true,
			homeBtn: false,
			//backToPage: 'useraccount',
			model: {},
			lastrfno:1,
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
				this.lastrfno =1;
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
				cashAccountInfo.setParam("reqbmp", 2);
				cashAccountInfo.exec({
					scope: this,
					suc: function(data) {
						if (data.rc == 0) {
							if (param.firstRequest && data.payoutlist.length == 0) {
								if (self.payoutNoData.css("display") == "none" || self.payoutNoData.css("display") == undefined) {
									self.payoutNoData.show();
								}
							}
							if (data.payoutlist.length) {
								this.lastrfno =this.lastrfno+1;
								this.modelDataList = _.union(this.modelDataList, data.payoutlist)
							}
							callback(data.payoutlist);
							if (Config.IS_INAPP) {//
								$('.header').css('top', '0px');
							} else {
								$('.header').css('top', '44px');
							}
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
				this.itemContainter = this.$el.find('#payout_list');
				this.moreDivParent = this.$el.find('.wrap');
				this.payoutNoData = this.$el.find('#payout_list_no_data');
			}
		});
		return View;
	});