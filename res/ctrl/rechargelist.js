/**
* @author wxm
* @desc:  Wallet V5.9
*/

define(['Config', 'Log', 'Util', 'WalletSelectCtrl', 'WalletFilterListView', 'WalletModel', 'WalletStore', 'Message', 'text!rechargelist_html'],
function (Config, Log, Util, WalletSelectCtrl, WalletFilterListView, WalletModel, WalletStore, Message, html) {
    var STRING = {
        PAGE_TITLE: "提现记录 "
    };
    var DEF_SELECT_IDX = 4;

    var accntListRechargeModel = WalletModel.WalletAccountListRecharge.getInstance();

    //restype: 1：处理中    2：充值成功    3：充值失败    8：充值退回
    var itemTemplate =
        '<tr class="' +
                '<% if(restype == 3){%>' +
                'bcf8 grey ' +
                '<%}%>' +
                'J_ListRow" data-rfno=<%= rfno %>>' +
            '<td width="28%" class="font12"><%= smdateShort %></td>' +
            '<td width="35%"><div class=' +
                '<% if(restype != 3){%>' +
                'cblack' +
                '<%}%>' +
                '><%= srcnameShort %></div>' +
            '</td>' +
            '<td align="right" width="37%">' +
                '<div><dfn class="font12">&#165; </dfn><%= amt %></span></div>' +
                '<div class="font12 ' +
                '<% if(restype == 1){%>' +
                    'green' +
                '<% } else if(restype == 2){%>' +
                    'cblack' +
                '<%}%>' +
                '">' +
                '<%= restypeUI %>' +
                '</div>' +
            '</td>' +
        '</tr>';

    var View = WalletFilterListView.extend({
        citybtn: STRING.PAGE_TITLE,
        tpl: html,
        //backToPage: 'transacthistory',
        //scroll view variables-------
        itemTemplate: itemTemplate, //abstract --must--
        //----------------------------
        selectData: [{ nameMenu: '成功', nameTitle: '充值成功 ', data: 2 },
                     { nameMenu: '失败', nameTitle: '充值失败 ', data: 3 },
                     { nameMenu: '处理中', nameTitle: '充值处理中 ', data: 1 },
                     { nameMenu: '充值退回', nameTitle: '充值退回 ', data: 8 },
                     { nameMenu: '全部', nameTitle: '充值记录 ', data: 0 }],
        selectIdx: DEF_SELECT_IDX,
        onCreate: function () {
            this.model = accntListRechargeModel;
            this.inherited(arguments);
        },
        onShow: function (referer) {
            if (referer != this.cmdRefresh && this.referrer == 'transacthistory') {
                this.selectIdx = DEF_SELECT_IDX;
            }
            this.inherited(arguments);
        },
        onHide: function (referer) {
            this.inherited(arguments);
            //if (this.refererPage == 'rechargedetail') {
            //    this.clearDataOnHide = false;
            //} else {
            //    this.clearDataOnHide = true;
            //}
        },
        onListRowClick: function (e) {
            this.inherited(arguments);

            var rfno = $(e.currentTarget).attr('data-rfno');
            var item = _.findWhere(this.modelDataList, { rfno: rfno });

            var detailStore = WalletStore.RechargeDetailStore.getInstance();
            detailStore.set(item);
            this.forward('rechargedetail');
            //this.forwardWithRetView('rechargedetail', this.viewname + '?selectidx=' + this.selectIdx);
        },
        setModelParam: function () {
            this.model.param.restype = this.selectData[this.selectIdx].data; //0：全部记录 1：处理中    2：充值成功    3：充值失败    8：充值退回
            this.model.param.lastrfno = this.lastrfno;
            delete this.model.param.rfno;
        }
    });

    return View;
});
