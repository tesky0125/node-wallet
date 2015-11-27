/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['IdCodePageView', 'WalletModel', 'WalletStore', 'text!modifysecuritymobile_html', 'Config', 'Util'],
function (IdCodePageView, WalletModel, WalletStore, html, Config, Util) {

    var STRING = {
        PAGE_TITLE: '修改安全验证手机',
        CANCEL: '取消',
        CALL: '拨打',
        ALERT_TITLE: '拨打客服电话 10106666转8'
    };

    var View = IdCodePageView.extend({
	    tpl: html,
	    title: STRING.PAGE_TITLE,
	    backBtn: true,
	    tel: true,
	    requestCode: 31,
        reqflag: 0,
	    events: {
	        'click .J_NextBtn': 'checkMobile',
	        'click .J_Get-indentify-code': 'getIdentifyCode',
	        'click .J_CallServices': 'callServices'
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
            userModel.param.reqbmp = 0; //all;
		    userModel.exec({
		        suc: function (userData) {
		            that.hideLoading();
		            userData.pagetype = 'modify';
		            var t = _.template(that.tpl, userData);
		            that.$el.html(t);
		            that.bindIDCodeEvent();
		            that.turning();
		            setTimeout(function () {
		                that.getIdentifyCode();
		            }, 100);
		        },
		        fail: this.onModelExecFail,
		        scope: this
		    });
		},
		goNext: function () {
		    this.forward('modifysecuritymobile2');
		},
		callServices: function () {
		    this.showDlg({
		        message: STRING.ALERT_TITLE,
		        buttons: [{
		            text: STRING.CANCEL,
		            click: function () {
		                this.hide();
		            }
		        }, {
		            text: STRING.CALL,
		            click: function () {
		                Util.callPhone(Config.SERVICE_TEL_NUMBER);
		            }
		        }]
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
						that.storeIdCodeToGoNext();
					}
				});
			}else{
				this.storeIdCodeToGoNext();
			}
		},
		storeIdCodeToGoNext:function(){
			this.clearIntervalStore();
			var idCode = this.$el.find('.J_Indentify').val();
			var verificationStore = WalletStore.Verification.getInstance();
			verificationStore.setAttr({ 'orivcode': idCode });
			this.goNext();
		}
	});

	return View;
});

