/// <summary>
/// 找回密码 creator:caofu; createtime:2013-10-28
/// </summary>
define(['CommonStore', 'WalletStore', 'WalletModel', 'WalletPageView', "text!selbankcard_html", 'Util'],
		function (commonStore, WalletStore, WalletModel, WalletPageView, html, Util) {
		    var urlTo = null,
            userStore = commonStore.UserStore.getInstance(),
            userInfo = userStore.getUser(),
            bankListModel = WalletModel.BankListModel.getInstance(),
            bankListStore = WalletStore.BankListStore.getInstance(),
            transferStore = WalletStore.TransferStore.getInstance();
             var STRING = {
		            PAGE_TITLE: "选择银行"
		        };
		    var View = WalletPageView.extend({
		        tpl: html,
		        title:STRING.PAGE_TITLE,
		        backBtn: true,
		         homeBtn: false,
		         //backToPage: 'todebitcard',
		        onHide: function () { 
		        	this.inherited(arguments);
		        	this.hideLoading(); urlTo = null; 
		        },
		        onCreate: function () {
		        	this.inherited(arguments);
		            //this.injectHeaderView();
		            this.render();
		        },
		        onShow: function () {
		        	this.inherited(arguments);           
		            //高亮已选择项
		            $("#js_banklist>dd").removeClass("ok_crt");
		            var idName = transferStore.get().bankname;
		            var activeEle = _.find($("#js_banklist>dd"), function (e) { return $(e).text() == idName });
		            if (activeEle) {

		                $(activeEle).addClass("ok_crt");

		            }

					this.updatePage();
		            this.turning();
		        },
		        render: function () {
		            this.transferBoxFun = _.template(this.tpl);
		        },
		        _getBankListSer: function (data) {
		            var self = this;
		            self.hideLoading();
		            if (data &&　data.banklist) {
		                self.$el.html(self.transferBoxFun({ data: data.banklist }));
		            }
		        },
		        reqBankListSer: function(){
		            var self = this;
		            //没数据就去取
		            self.showLoading();
		            bankListModel.exec({
		                suc: self._getBankListSer,
		                scope: self,
		                fail: function (data) {
		                    self.onModelExecFail(data); //404
		                },
		                abort: function (data) {
		                   self.onModelExecFail(data); //404
		                }
		            });
		        },
		        getBankListFn: function () {
		            var data = bankListStore.get() && bankListStore.get().banklist;
		            var self = this;
		            if (!data) {
		                this.reqBankListSer();
		            } else if (data.length == 0) {
		                this.reqBankListSer();
		            } else {
		                this.$el.html(this.transferBoxFun({ data: data }));
		            }
		        },
		        showErrorMessage: function () {//加载失败，显示404
		            var self = this;
		            self.showWarning404(function () {
		                self.hideWarning404();
		                self.onCreate();
		            });
		        },
		        events: {
		            'click #js_return': 'backAction', //返回
		            'click #js_banklist>dd': 'chooseBank'
		        },

		        updatePage: function () {
		            var self = this;
		            //add check before request.
		            if (!Util.checkUser(this))
		                return;

		            this.getBankListFn();//获取银行卡列表
		        },
		        chooseBank: function (e) {
		            var bankName = $(e.target).text(),
                    bankId = parseInt($(e.target).data("id"));

		            var oldBankId = transferStore.getAttr('bankid');
		            if ((oldBankId != null) && oldBankId != bankId) {
		                //如果换了银行，则清空开户行名
		                transferStore.setAttr('bankname', "");
		            }

		            transferStore.setAttr('bankname', bankName, this.uid);
		            transferStore.setAttr('bankid', bankId);

		            this.back("todebitcard")
		        },
                returnHandler:function(){
		           this.hideWarning404();
		           if (!urlTo || urlTo.length <= 0) {
		               this.back();
		           } else {
		               this.back(urlTo);
		           }
                }
		    });
		    return View;
		});