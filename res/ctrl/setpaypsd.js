/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['WalletPageView', 'WalletModel', 'WalletStore', 'text!setpaypsd_html', 'Message', 'Util', 'cUtilCryptBase64', 'Config'],
function (WalletPageView, WalletModel, WalletStore, html, Message, Util, cUtilCryptBase64, Config) {

    var STRING = {
        PAGE_TITLE: '设置支付密码',
        NEED_HELP: '联系客服',
        CONFIRM: '  确定',
        DIALOG_TITLE: '无法设置支付密码，请联系携程客服以完成相关操作。',
        CANCEL: '取消'
    };

    var View = WalletPageView.extend({
    	redirect:true,
	    tpl: html,
	    title: STRING.PAGE_TITLE,
	    backBtn: true,
	    backToPage: 'securitycenter',
	    headerBtn: { title: "说明", id: 'J_Explain', classname: 'explain' },
	    commitHandler: {
	        id: 'J_Explain', callback: function () {
	            this.getCstMsg().showMessage(Message.get(112));
	        }
	    },
	    events: {
	        'click .J_NextBtn':'verfiedPsd'
	    },
		onCreate: function (){
		    this.inherited(arguments);
		    this.render();
		},
		onShow: function (referer) {
		    this.inherited(arguments);
		    var that = this;
		    this.$el.find('.J_Input').val('');

		    this.loading.show();
		    this.bIgnoreBackKey = false; //reset
		    var checkModel = WalletModel.WalletAccountCheck.getInstance();
		    checkModel.param.optype = 7;
		    checkModel.exec({
		        suc: function (info) {
		            that.loading.hide();
		            that.procRcCode(info, true, true);
		            if (info.rc == 0) {
		                that.turning();
		            } else {
		                that.showDlg({
		                    message: STRING.DIALOG_TITLE,
		                    buttons: [{
		                        text: STRING.CANCEL,
		                        click: function () {
		                            this.hide();
		                            that.returnHandler();
		                        }
		                    }, {
		                        text: STRING.NEED_HELP,
		                        click: function () {
		                            Util.callPhone(Config.SERVICE_TEL_NUMBER);
		                        }
		                    }]
		                });
		                that.bIgnoreBackKey = true;//disable back key
		            }
		        },
		        fail: this.onModelExecFail,
		        scope: this
		    })
		},
		verfiedPsd: function () {
		    var that = this;
		    var input = this.$el.find('.J_Psd');
		    var val = input.val();
		    if (val == '') {
		        this.showToast(Message.get(305));
		        return;
		    }

		    this.loading.show();
		    var checkModel = WalletModel.WalletAccountCheck.getInstance();
		    var verificationStore = WalletStore.Verification.getInstance();
		    checkModel.param.optype = 2;
		    checkModel.param.accinfo = cUtilCryptBase64.Base64.encode(val);

		    checkModel.exec({
		        suc: function (info) {
		            that.loading.hide();
		            that.procRcCode(info,true);
		            if (info.rc == 0) {
		                verificationStore.setBase64({ 'loginpsd': val });

		                that.goNext();
		            } else {
		                input.val('');
		            }
		        },
		        fail: function (data) {
		            that.onModelExecFailAsync(data, 301);
		        },
		        scope: this
		    })
		},
		onHide: function (){
		    this.inherited(arguments);
		    this.$el.find('.J_Psd').val('');
		    // this.clearMyTokenInfo(); //clear my ret page after used
		},
		goNext: function () {
			this.forward('setpaypsd2');
		    // if (this.tokenInfo()) {
		    //     this.forwardWithToken('setpaypsd2', false); //use forward to make referer valid, because jump will have no referer
      //           this.clearMyTokenInfo(); //clear my ret page after used
		    // } else {
		    //     if (this.retPage) {
		    //         this.forwardWithRetView('setpaypsd2', decodeURIComponent(this.retPage));
		    //     } else {
		    //         this.forwardWithRetView('setpaypsd2', this.backToPage);
		    //     }
		    // }
		},
		render: function (){
			this.$el.html(this.tpl)
		},
		returnHandler: function () {
		    //if (this.getEntryView() == 'chgpwd') {
		    //    this.returnHandler();
		    //} else {
		        this.inherited(arguments);
		    //}
		    //return true;
		}
	});

	return View;
});

