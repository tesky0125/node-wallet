define(['CommonStore', 'WalletModel', 'WalletStore', 'WalletPageView', "Util", "text!addpostprovince_html"],
		function (cs, CPageModel, CPageStore, WalletPageView, Util, viewhtml) {

		    //用户Store
		    var userStore = cs.UserStore.getInstance(),
                postCityStore = CPageStore.CityPrivinceStore.getInstance(),
                postCityModel = CPageModel.PostPrivinceModel.getInstance(),
                selAddrStore = CPageStore.SelectAddrStore.getInstance();
                	 var STRING = {
		            PAGE_TITLE: "选择所在地区"
		        };
		    var View = WalletPageView.extend({
		    	backBtn: true,
		         homeBtn: false,
		         title: STRING.PAGE_TITLE,
		         //backToPage: 'todebitcard',
		        render: function () {
		            this.$el.html(viewhtml);
		            this.els = {
		                addr_list: this.$el.find('#p_add_wrap'),
		                addr_list_tpl: this.$el.find('#p_add_tpl')
		            };
		            this.elHTML = _.template(this.els.addr_list_tpl.html());
		        },
		        _CityListSuc: function (data) {
		            var self = this;
		            if (data && data.rc == 0) {
		                postCityStore.setAttr("provinces", data.cantonlist);
		                self._complete();
		            }
		        },
		        _complete: function () {
		            var data = (postCityStore.get() && postCityStore.get().provinces) || {};
		            var rdata = {
		                'cityData': data,
		                'curPrvnName': selAddrStore.getAttr('prvnName') || 0
		            };
		            this.hideLoading();

		            this.els.addr_list.html(this.elHTML(rdata));

		            this.changePvnFlag = false;
		            this.turning();
		        },
		        reqCitySer: function () {
		            var self = this;
		            this.showLoading();
		            postCityModel.setParam("datatype", 4);
		            postCityModel.setParam("parentkey", 0);
		            postCityModel.exec({
		                suc: self._CityListSuc,
		                scope: self,
		                fail: function (data) {
		                    self.onModelExecFail(data); //404
		                },
		                abort: function (data) {
		                    self.onModelExecFail(data); //404
		                }
		            });
		        },
		        updatePage: function () {
		            var self = this;
		            var data = (postCityStore.get() && postCityStore.get().provinces);
		            if (!data) {
		                this.reqCitySer();
		            } else if (data.length == 0) {
		                this.reqCitySer();
		            } else {
		                this._complete();
		            }
		        },

		        forwardAction: function (e) {
		            var $cityDiv = $(e.currentTarget).find('.city-group-title');
		            var oldPrvnId = selAddrStore.getAttr('prvnId');
		            var prvnId = $cityDiv.attr('data-prvnid'),
                        prvnname = $cityDiv.attr('data-prvnname');
		            //将来源重新设置回去，以免下面代码让来源丢失
		            var from = selAddrStore.getAttr("from");
		            var diffFlag = 0;//1:不同；0：相同

		            //选中省改变时，把市县数据清空
		            if (oldPrvnId != prvnId) {//不同
		                //                selAddrStore.rollback(['prvnId', 'prvnName', 'prvn', 'ctyId', 'ctyName', 'cty', 'dstrId', 'dstrName', 'dstr']);
		                selAddrStore.setAttr('ctyId', "");
		                selAddrStore.setAttr('ctyName', "");
		                selAddrStore.setAttr('cty', "");
		                selAddrStore.setAttr('dstrId', "");
		                selAddrStore.setAttr('dstrName', "");
		                selAddrStore.setAttr('dstr', "");
		                diffFlag = 1;//选择城市不同
		            }
		            selAddrStore.setAttr('prvnId', prvnId);
		            selAddrStore.setAttr('prvnName', prvnname);
		            selAddrStore.setAttr('prvn', prvnname);
		            selAddrStore.setAttr('from', from);

		            this.forward('addpostcity?isdiff=' + diffFlag);
		        },
                returnHandler:function(){
		           this.data = {};
		           this.hideWarning404();
		           // selAddrStore.rollback(['prvnId', 'prvnName', 'prvn', 'ctyId', 'ctyName', 'cty', 'dstrId', 'dstrName', 'dstr']);
		           this.forward('todebitcard');
                },
		        events: {
		            'click li.cityli': 'forwardAction'
		        },
		        onCreate: function () {
		        	this.inherited(arguments);
		            //this.injectHeaderView();
		            this.render();
		        },
		        //数据加载阶段
		        onShow: function () {
		        	this.inherited(arguments);
		            var self = this;
		            //add check before request.
		            if (!Util.checkUser(this))
		                return;

		            this.updatePage();
		        },
		        onHide: function () {
		        	this.inherited(arguments);
		        }
		    });

		    return View;
		});
