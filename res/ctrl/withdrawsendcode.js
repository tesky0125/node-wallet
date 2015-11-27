/**
* @author luzx
* @desc:  Wallet V5.7
*/
	
define(['IdCodePageView', 'WalletModel', 'WalletStore', 'text!modifysecuritymobile_html', 'WalletResk','Config'],
function (IdCodePageView, WalletModel, WalletStore, html, WalletResk,Config) {

    var STRING = {
        PAGE_TITLE: '手机验证'
    };

    var View = IdCodePageView.extend({
	    tpl: html,
	    title: STRING.PAGE_TITLE,
	    backBtn: true,
	    tel: true,
	    requestCode: 60,
        reqflag: 0,
	    events: {
	        'click .J_NextBtn': 'checkMobile',
	        'click .J_Get-indentify-code': 'getIdentifyCode'
	    },
		onCreate: function (){
		    this.inherited(arguments);
		},
		onShow: function () {
		    this.inherited(arguments);
		    this.render();
		},
		render: function () {
		    var that = this;
		    this.showLoading();
		    var userModel = WalletModel.WalletUserInfoSearch.getInstance();
		    userModel.param = {};
		    userModel.param.reqbmp = 0; //all；
		    userModel.exec({
		        suc: function (userData) {
		            userData.pagetype = 'withdraw';
		            that.hideLoading();
		            var t = _.template(that.tpl, userData);
		            that.$el.html(t);
		            that.bindIDCodeEvent();
		            that.turning();
		            setTimeout(function () {
		            that.getIdentifyCode();
		                that.getIdentifyCode();
		            }, 100);
		        },
		        fail: this.onModelExecFail,
		        scope: this
		    });
		},
		goNext: function () {
		    var that = this;
		    var continueWithDraw = WalletModel.ContinueWithDraw.getInstance();
		    var WithdrawCardStore = WalletStore.WithdrawCard.getInstance();
		    continueWithDraw.param.vercode = this.$el.find('.J_Indentify').val();
		    continueWithDraw.param.terminate = 0;
		    continueWithDraw.param.rfno = WithdrawCardStore.getAttr("rfno");
		    this.loading.show();
		    continueWithDraw.exec({
		        suc: function (info) {
		            that.loading.hide();
		            that.procRcCode(info, true);
		            WithdrawCardStore.setAttr("rc", info.rc);
		            WithdrawCardStore.setAttr("message", info.rmsg);
		            var ret = WalletResk.getCase(that, info.rc, info.rmsg);
		            ret();
		        },
		        fail: function (data) {
		            that.onModelExecFailAsync(data, 330);
		        },
		        scope: this
		    });
		},
		checkMobile: function () {
			var that = this;
		    var f = this.checkInfo();
		    if (!f) {
		        return;
		    }
			if(!Config.VERIFY_ID_CODE) {
				this.loading.show();
				this.manualVerfiedIdentifyCode(this.$el.find('.J_Indentify'), function(ret){
					that.loading.hide();
					if(ret) {
						that.goNext();
					}
				});
			}else{
				this.goNext();
			}
		}
	});
	
	return View;
});

