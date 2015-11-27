/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['IdCodePageView', 'WalletModel', 'WalletStore', 'text!modifysecuritymobile2_html', 'Message', 'Util', 'Config', 'cUtilCryptBase64', 'Scmg'],
function (IdCodePageView, WalletModel, WalletStore, html, Message, Util, Config, cUtilCryptBase64, Scmg) {

    var STRING = {
        PAGE_TITLE: '修改安全验证手机'
    };

    var View = IdCodePageView.extend({
	    tpl: html,
	    title: STRING.PAGE_TITLE,
	    backBtn: true,
	    requestCode: 31,
	    reqflag: 1,
	    tel: true,
	    events: {
	        'click .J_NextBtn': 'checkMobile',
	        'click .J_Get-indentify-code': 'getIdentifyCode'
	    },
		onCreate: function (){
		    this.inherited(arguments);
		    this.render();
		    this.bindIDCodeEvent();
		},
		onShow: function (referer) {
		    this.inherited(arguments);

		    if (this.refererPage != 'modifysecuritymobile' && !Config.IS_INAPP) {//
		        this.forward('securitycenter');
		        return;
		    }

		    this.turning();
		},
		render: function (){
			var that=this;
			this.$el.html(this.tpl);
			setTimeout(function () {
                that.existIntervalStore();
            }, 100);
		},
		checkMobile: function (){
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
						that.getIdCodeToGoNext();
					}
				});
			}else{
				this.getIdCodeToGoNext();
			}

		},
		getIdCodeToGoNext:function(){
			var that = this;
			var moble = this.$el.find('.J_Mobile').val();
			var idCode = this.$el.find('.J_Indentify').val();

			var accModify = WalletModel.WalletAccountModify.getInstance();
			var verificationStore = WalletStore.Verification.getInstance();
			var userStore = WalletStore.UserInfoStore.getInstance();
			accModify.param.reqtype = this.requestCode;
			accModify.param.newinfo = cUtilCryptBase64.Base64.encode(moble);
			accModify.param.orivcode = verificationStore.getAttr('orivcode');
			accModify.param.newvcode = idCode;
			///accModify.param.paypwd = verificationStore.getAttr('paypsd');
			accModify.param.paypwd = Scmg.getP();
			that.loading.show();
			accModify.exec({
				suc: function (info) {
					that.loading.hide();
					that.procRcCode(info, true);

					if (info.rc == 0) {
						var mobile = that.$el.find('.J_Mobile').val();
						mobile = Util.getMobile(mobile);
						userStore.setAttr('secmobile', mobile);
						///verificationStore.setAttr('paypsd', '');
						Scmg.setP('');
						verificationStore.setAttr('secmobileChanged', 1);
						that.back('securitycenter');
					}
				},
				fail: function (data) {
					that.onModelExecFailAsync(data, 327);
				},
				scope: this
			})
		}
	});

	return View;
});

