/**
 * @author yjj
 * @desc:  Wallet V6.10
 */
define(['text!myinsrc_html', 'Config', 'Util', 'WalletPageView', 'WalletModel', 'WalletStore'],
    function(html, Config, Util, WalletPageView, WalletModel, WalletStore) {
        var STRING = {
            PAGE_TITLE: '我的保障'
        };

        var itemTmpl = '' +
            '<li class="J_Insrc_List_Item" data-insrctype="<%=insrctype%>" data-orderid="<%=orderid%>" data-orderstatus="<%=orderstatus%>">' +
            '    <div class="aqxicon3"><img width="70" height="70" src="<%=prdimgurl%>"></img></div>' + 
            '    <div class="ml85">' +
            '       <h3 class="mb10 mt5"><%=prdname%></h3>' +
            '       <p class="font12 lh120 grey mb5"><%=prddesc%></p>' +
            '<%if(orderstatus === 2){%>' + 
            '       <span>保障中</span>' +
            '<%}else{%>' + 
            '       <div class="font16 green lh1"><%=payamount%><small>元</small></div>' +
            '<%}%>' +
            '    </div>' +
            '</li>';

        var myInsrcListModel = WalletModel.InsrcOrderList.getInstance();
        //var myInsrcDetailStore = WalletStore.InsrcDetailStore.getInstance();
        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            //backToPage:'index',
            model: {},
            events: {
                'click .J_Insrc_List_Item': function(e) {
                    var $item = $(e.currentTarget);
                    var insrctype = parseInt($item.attr('data-insrctype'), 10);
                    var orderid = parseInt($item.attr('data-orderid'), 10);
                    var orderstatus = parseInt($item.attr('data-orderstatus'), 10);
                    //myInsrcDetailStore.setAttr('orderid', orderid);
                    if(orderstatus === 2){
                        this.forward('myinsrcdetail?orderid='+orderid+'&insrctype='+insrctype);
                    }else{
                        this.forward('insrcstart?insrctype='+insrctype);//TODO
                    }
                }
            },
            onShow: function() {
                this.inherited(arguments);
                if (!Util.checkUser(this))
                    return;

                this._loadingMoreData();
            },
            _loadingMoreData: function() {
                this.loading.show();
                myInsrcListModel.param.reqtype = "1|2"; 
                myInsrcListModel.exec({
                    scope: this,
                    suc: function(data) {
                        this.loading.hide();
                        if (data.rc == 0) {
                            this.model = data;
                            this.render();
                        }else{
                            this.onModelExecFail(data);
                        }
                    },
                    fail: this.onModelExecFail
                });
            },
            render: function() {
                this.$el.html(_.template(this.tpl));
                this._els = {
                    $insrcList: this.$el.find(".J_InsrcList")
                };

                var insrcListUI = this.buildListUI();
                this._els.$insrcList.append(insrcListUI);

                this.turning();
            },
            buildListUI: function() {
                var ret = '';
                for (var i = 0; i < this.model.insuoderlist.length; i++) {
                    var insuItem = this.model.insuoderlist[i];
                    if(insuItem.payamount == 0 && insuItem.orderstatus != 2) continue;
                    //update payamount
                    insuItem.payamount = (insuItem.payamount / 100).toFixed(2);
                    ret += _.template(itemTmpl, insuItem);
                }
                return ret;
            },
            returnHandler: function() {
                if (!Config.IS_INAPP) {
                    this.back('index');
                } else {
                    this.inherited(arguments);
                }
            }
        });

        return View;

    });