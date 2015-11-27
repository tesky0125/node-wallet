define(['CommonStore', 'WalletModel', 'WalletStore', 'WalletPageView', "Util", "text!addpostcity_html"],
		function (cs, CPageModel, CPageStore, WalletPageView, Util, viewhtml) {
		    //用户Store
		    var userStore = cs.UserStore.getInstance(),
            //选择地址Store
                addrStore = CPageStore.SelectAddrStore.getInstance(),
                cityModel = CPageModel.PostCityModel.getInstance(),
                cityStore = CPageStore.CityListStore.getInstance();
		    var View = WalletPageView.extend({
		        districtData: null,
		        preOpenGroup: null,
		        title:'',
		         backBtn: true,
		         homeBtn: false,
		         backToPage: 'addpostprovince',
		        render: function () {
		            //this.viewdata.req = this.request;
		            this.$el.html(viewhtml);
		            this.els = {
		                elcitylisttpl: this.$el.find('#post-citylist-tpl'),
		                elcitylistbox: this.$el.find('#postcitylistbox')
		            };
		            this.cityListTplfun = _.template(this.els.elcitylisttpl.html());
		        },
		        events: {
		            'click .city-group-title': 'cityItemonClick'
		        },
		        onCreate: function () {
		        	this.inherited(arguments);
		            this.render();
		        },
		        _CityListSuc: function (data) {
		            var self = this;
		            var prvnId = (addrStore.get() && addrStore.get()["prvnId"]) || "31";
		            self.hideLoading();
		            if (data && data.rc == 0) {
		                cityStore.setAttr("citys", data.cantonlist);
		                self.districtData = data.cantonlist;
		                self.updatePage(prvnId);
		            }
		        },
		        reqCityServer: function (prvnId) {
		            var self = this;
		            this.showLoading();
		            cityModel.setParam("parentkey", prvnId);
		            cityModel.setParam("datatype", 4);
		            cityModel.exec({
		                suc: this._CityListSuc,
		                scope: this,
		                fail: function (data) {
		                    self.onModelExecFail(data); //404
		                },
		                abort: function (data) {
		                    self.onModelExecFail(data); //404
		                }
		            });
		        },
		        //数据加载阶段
		        onShow: function () {
		        	this.inherited(arguments);
		        	var self = this;

		        	//对HeaderView设置数据
		        	this.headerview.set({
		        	    title: prvnName,
		        	    back: true,
		        	    view: self
		        	});

		        	this.headerview.show();
		        	this.setTitle('选择城市');

		        	//add check before request.
		        	if (!Util.checkUser(this))
		        	    return;

		            var addrInfo = addrStore.get();
		            var prvnId = addrInfo["prvnId"] || "1000025";
		            var prvnName = addrInfo["prvnName"] || "上海";
		            var ctyName = addrInfo["ctyName"] || 0;
		            this.districtData = cityStore.get() && cityStore.get().citys;
		            var isDiff = this.getQuery("isdiff");
		            if (!this.districtData) {
		                this.reqCityServer(prvnId);
		            } else if (this.districtData.length == 0) {
		                this.reqCityServer(prvnId);
		            } else if (isDiff == 1) {
		                this.reqCityServer(prvnId);
		            } else {
		                this.updatePage(prvnId);
		            }
		           

		            if (ctyName) {
		                this.preOpenGroup = $('.citylistclick div');
		            }
		        },
		        updatePage: function (prvnId) {
		            var citysObj = {
		                "citys": this.districtData || []
		            };

		            this.els.elcitylistbox.html(this.cityListTplfun(citysObj));
		            this.turning();
		        },
		        onHide: function () { 
		        	this.inherited(arguments);
		        },
		        cityItemonClick: function (e) {
		            var cur = $(e.currentTarget);
		            var dstrId = cur.attr('data-key');
		            var dstrName = cur.html();
		            //先恢复至原始值，再赋值
		            addrStore.rollback(['dstrId', 'dstrName', 'dstr']);
		            addrStore.setAttr('dstrId', dstrId);
		            addrStore.setAttr('dstrName', dstrName);
		            addrStore.setAttr('dstr', dstrName);
		            addrStore.setAttr('from', "");
		            this.forward('todebitcard');
		        }
		    });
		    return View;
		});
