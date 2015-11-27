/**
 * @author yjj
 * @desc:  Wallet V6.10
 */
define(['text!myinsrcdetail_html', 'Util', 'WalletPageView', 'WalletModel', 'WalletStore', 'Config'],
    function(html, Util, WalletPageView, WalletModel, WalletStore, Config) {
        var STRING = {
            PAGE_TITLE: '',
            SEE_SLAUSE:'查看《保险条款》',
            SEE_NOTICE:'查看《保险须知&amp;条款》'
        };

        var myInsrcDetailModel = WalletModel.InsrcOrderDetail.getInstance();
        var myInsrcDetailStore = WalletStore.InsrcDetailStore.getInstance();

        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            //backToPage: 'myinsrc',
            model: {},
            events: {
                'click .J_Insrc_Go_Claim': function() {
                    this.forward('myinsrcclaim');
                },
                'click .J_Insrc_Claim': function(e) {
                    var phone = $(e.currentTarget).attr('data-phone');
                    Util.callPhone(phone);
                },
                'click .J_GoNotice': function() {
                    if (parseInt(this.getQuery('insrctype')) == 1) {
                        if (Config.IS_INAPP) {
                            CtripUtil.app_open_url(this.model.clauseaddr, 3);
                        } else {
                            window.open(this.model.clauseaddr, '保险条款');
                        }
                    } else if (parseInt(this.getQuery('insrctype')) == 2) {
                        this.forward('insrctips?p=2');
                    }
                }
            },
            onCreate: function() {
                this.inherited(arguments);
            if (parseInt(this.getQuery("insrctype")) == 2) {
                    this.wxShare = Util.shareHighInsrcAct();
                    if (Config.IS_INAPP) {
                        this.right = [{
                            'tagname': 'share',
                            callback: _.bind(this.wxShare.hybirdShare, this),
                        }];
                    }
                }
                this.turning();
            },
            onShow: function() {
                this.inherited(arguments);
                if (!Util.checkUser(this))
                    return;

                this._loadingMoreData();
            },
            _loadingMoreData: function() {
                this.loading.show();

                //var orderid = myInsrcDetailStore.getAttr('orderid');
                var orderid = this.getQuery('orderid');

                myInsrcDetailModel.param.orderid = orderid;
                myInsrcDetailModel.exec({
                    scope: this,
                    suc: function(data) {
                        this.loading.hide();
                        if (data.rc == 0) {
                            this.model = data;
                            this.storeClaimPhone();
                            this.render();
                        }else{
                            this.onModelExecFail(data);
                        }
                    },
                    fail: this.onModelExecFail
                });
            },
            render: function() {
                var prdname = myInsrcDetailStore.getAttr('prdname');
                this.model.insrctype = parseInt(this.getQuery('insrctype'))
                this.resetHeaderView({
                    title: prdname
                });
                this.$el.html(_.template(this.tpl, this.model));

                this._els = {
                    $insrcDetailList: this.$el.find(".J_InsrcDetailList"),
                    $goNotice:this.$el.find(".J_GoNotice")
                };
                var insrcListUI = this.buildListUI();
                this._els.$insrcDetailList.append(insrcListUI);
                switch (this.model.insrctype){
                    case 1:
                    this._els.$goNotice.html(STRING.SEE_SLAUSE);
                    break;
                    case 2:
                    this._els.$goNotice.html(STRING.SEE_NOTICE);
                    break;
                }
                this.turning();
            },
            buildListUI: function() {
                var ret = '';
                for (var i = 0; i < this.model.insoitemlist.length; i++) {
                    var item = this.model.insoitemlist[i];
                    var html = '<li><i></i><span>' + item.name + '</span>';
                    if (item.itemtype ==1) {
                        html += '<div class="blue J_Insrc_Claim" data-phone="' + item.value + '">' + item.value + '</div></li>';
                    } else{
                        html += '<div>' + item.value + '</div></li>';
                    }
                    ret += html;
                }
                return ret;
            },
            storeClaimPhone: function() {
                for (var i = 0; i < this.model.insoitemlist.length; i++) {
                    var item = this.model.insoitemlist[i];
                    if (item.itemtype === 1) {
                        myInsrcDetailStore.setAttr('claimphone', item.value);
                    }
                }
            }
        });

        return View;

    });