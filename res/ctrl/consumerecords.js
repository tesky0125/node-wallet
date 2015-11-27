/**
 * @author alivechen
 * @desc:  Wallet V6.5
 */

define(['cMemberService', 'Util', 'WalletListView', 'WalletModel', 'Config'],
    function(cMemberService, Util, WalletListView, WalletModel, Config) {

        var STRING = {
            PAGE_TITLE: "消费记录"
        };
        var consumRecordsModel = WalletModel.ConsumeRecordsModel.getInstance();

        var tplHtml = '<article class="wrap " >' +
            '<ul  id="consume_list" class="border2 p10_15li font14 grey2">' + '</ul></article>';
        var itemTemplate = '<li>' +
            '<div class="grey3 lh1 font13"><%= csmtime%></div>' +
            '<div class="ellips cblack"><span class="font16 ml10 fr"><small>&#165;</small><%=amt%></span><%= csmname %></div>' +
            '<div  class="font13 lh1">订单号：<%= orderid %></div>' +
            '</li>';
        var View = WalletListView.extend({
            tpl: tplHtml,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            homeBtn: false,
            //backToPage: 'index',
            model: {},
            lastrfno: '',
            events: {},
            itemTemplate: itemTemplate,
            firstLoadList: null,
            isCompleted: false,
            isLoading: false,
            onCreate: function() {
                console.log('onCreate');
                if (Config.IS_INAPP) {
                    cMemberService.memberLogin({
                        param: "from=" + encodeURIComponent(location.href),
                        callback: function(userData) {}
                    });
                }
                this._initModeData();
                this.inherited(arguments);

            },
            _initModeData: function() {
                this.lastrfno = '';
                this.modelDataList = [];
            },
            resetList: function() {
                this._initModeData();
                this._gettingData = false;
                this.inherited(arguments);
            },
            onShow: function() {
                this.inherited(arguments);
                this.render();
            },

            onHide: function() {
                this.inherited(arguments);
                //to hide ctrip menu
            },
            onButtomPull: function(param, callback) {
                var self = this;
                consumRecordsModel.exec({
                    scope: this,
                    suc: function(data) {
                        if (data.rc == 0) {
                            if (param.firstRequest && data.csmlist.length == 0) {
                                this.noRecord.removeClass('hidden');
                                this.itemContainter.hide();
                            }
                            if (data.csmlist.length) {
                                this.lastrfno = data.csmlist[data.csmlist.length - 1].rfno;
                                this.modelDataList = _.union(this.modelDataList, data.csmlist)
                            }
                            callback(data.csmlist);
                        } else {

                        }
                    },
                    fail: function(data) {
                        this.onButtomPullExecFail(data, callback);
                    }
                })
            },
            render: function() {
                this.$el.html(_.template(this.tpl));
                this.itemContainter = this.$el.find('#consume_list');
                this.moreDivParent = this.$el.find('.wrap')
            },
            returnHandler: function() {
                //if (Lizard.P('fromHybrid')) {
                //    //Lizard.back();//TODO
                //} else {
                    this.inherited(arguments);
                //}
            }
        });
        return View;
    });