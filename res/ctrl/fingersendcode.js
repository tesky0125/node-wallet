/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['IdCodePageView', 'WalletModel', 'WalletStore', 'text!modifysecuritymobile_html', 'Message', 'Util', 'Config', 'CacheData', 'FingerHelper', 'Scmg'],
function (IdCodePageView, WalletModel, WalletStore, html, Message, Util, Config, CacheData, FingerHelper, Scmg) {

    var STRING = {
        PAGE_TITLE_PHONE: '验证安全手机',
        PAGE_TITLE_EMAIL: '验证安全邮箱',
        CONTINUE_OPEN: '继续开通',
        CONFIRM_QUIT: '确认退出',
        DIALOG_TITLE: '您要退出指纹支付开通吗？'
    };

    var View = IdCodePageView.extend({
	    tpl: html,
	    title: STRING.PAGE_TITLE,
	    backBtn: true,
	    //backToPage: 'securitycenter',
	    requestCode: null,
	    events: {
	        'click .J_Get-indentify-code': 'getIdentifyCode',
	        'click .J_NextBtn': 'checkMobile'
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
		            userData.pagetype = 'finger';
		            var t = _.template(that.tpl, userData);
		            that.$el.html(t);
		            that.bindIDCodeEvent();
		            that.turning();

		            if (userData.secmobile && userData.secmobile != '') {
		                that.requestCode = 55;
		                this.resetHeaderView({
		                    title: STRING.PAGE_TITLE_PHONE
		                });
		            } else {
		                that.requestCode = 56;
		                this.resetHeaderView({
		                    title: STRING.PAGE_TITLE_EMAIL
		                });
		            }

		            setTimeout(function () {
		                that.getIdentifyCode();
		            }, 100);
		        },
		        fail: this.onModelExecFail,
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
		},
		goNext:function(){
			var that = this;
			var fingetStore = WalletStore.FingerMark.getInstance();
			var verificationStore = WalletStore.Verification.getInstance();

			CacheData.setIsFpSettingChanged(true);

			FingerHelper.callFingerMethod(1001, function (rc) {
				if (rc.resultCode == 0) {
					//success
					var touchModel = WalletModel.TouchPaySet.getInstance();
					touchModel.param = {};
					touchModel.param.reqtype = 1;
					///touchModel.param.paypwd = verificationStore.getAttr('paypsd');
					touchModel.param.paypwd = Scmg.getP();
					that.loading.show();
					touchModel.exec({
						suc: function (info) {
							that.loading.hide();
							if (info && info.rc == 0) {
								FingerHelper.callFingerMethod(1002, function (rc) {
									if (rc.resultCode == 0) {
										fingetStore.setAttr('fingerMarkFlag', 0);
										that.back(CacheData.getFsBkPage());
									} else {
										//if fail, post request to close finger mark option.
										fingetStore.setAttr('fingerMarkFlag', 1);

										touchModel.param.reqtype = 0;
										touchModel.exec({
											suc: function (info) {
												that.back(CacheData.getFsBkPage());
											},
											fail: function (data) {
												that.back(CacheData.getFsBkPage());
											},
											scope: this
										});
									}
									///verificationStore.setAttr('paypsd', null);
									Scmg.setP('');
								}, {
									privateKey: info.pubkey,
									secretKeyGUID: info.kguid,
									deviceGUID: info.dguid
								})
							} else {
								fingetStore.setAttr('fingerMarkFlag', 1);
								that.back(CacheData.getFsBkPage());
							}
						},
						fail: function (data) {
							that.onModelExecFailAsync(data);
						},
						scope: this
					});
				} else if (rc.resultCode == 1 || rc.resultCode == 2) {
					//app fail or cancel
					that.showDlg({
						message: STRING.DIALOG_TITLE,
						buttons: [{
							text: STRING.CONTINUE_OPEN,
							click: function () {
								this.hide();
								if (Config.IS_INAPP) {//
									FingerHelper.callFingerMethod(1000, function (rc) {
										if (rc.resultCode == 0) {
											that.goNext.call(that);
										} else {
											fingetStore.setAttr('fingerMarkFlag', 1);
											that.back(CacheData.getFsBkPage());
										}
									})
								}

							}
						}, {
							text: STRING.CONFIRM_QUIT,
							click: function () {
								this.hide();
								that.back(CacheData.getFsBkPage());
							}
						}]
					});
				}
			}, { reason: Message.get(118) })
		}

	});

	return View;
});

