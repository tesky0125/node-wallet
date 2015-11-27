/// <summary>
/// 找回密码 creator:caofu; createtime:2013-10-28
/// </summary>
define(['CommonStore', 'WalletStore', 'WalletModel', 'WalletPageView', "text!transferid_html", 'Util'],
		function (commonStore, WalletStore, WalletModel, WalletPageView, html, Util) {
		    var urlTo = null,
             userStore = commonStore.UserStore.getInstance(),
             userInfo = userStore.getUser(),
             transferStore = WalletStore.TransferStore.getInstance();
              var STRING = {
		            PAGE_TITLE: "选择证件"
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
		            this.render();
		        },
		        onShow: function () {
		        	this.inherited(arguments);
		            //高亮已选择项
		            $("#js_idlist>dd").removeClass("ok_crt");
		            var idName = transferStore.get().idname || "身份证";
		            var activeEle = _.find($("#js_idlist>dd"), function (e) { return $(e).text() == idName });
		            if (activeEle) {
		                $(activeEle).addClass("ok_crt");
		            }


					this.updatePage();		            
					this.turning();
		        },
		        render: function () {
		            this.$el.html(this.tpl);

		        },
		        events: {
		            'click #js_return': 'backAction', //返回
		            'click #js_idlist>dd': 'chooseID'

		        },
		        updatePage: function () {
		            this.turning();
		            var self = this;

		            //add check before request.
		            if (!Util.checkUser(this))
		                return;

		            this.hideLoading();

		        },
		        chooseID: function (e) {
		            var idName = $(e.target).text(),
                   		 cardTypeId = parseInt($(e.target).data("value"));
		            transferStore.setAttr('idname', idName, this.uid);
		            transferStore.setAttr('idtype', cardTypeId);
		            this.back('todebitcard')
		        },
                returnHandler:function(){
		           this.hideWarning404();
		           if (!urlTo || urlTo.length <= 0) {
		               this.back("todebitcard");
		           } else {
		               this.forward(urlTo);//TODO	
		           }
                }
		    });
		    return View;
		});