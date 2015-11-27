/**
* @author wxm
* @desc:  Wallet V5.8
*/

define(['Config', 'Log', 'Util', 'WalletSelectCtrl', 'WalletFilterListView', 'WalletModel', 'WalletStore', 'Message', 'text!withdrawlist_html'],
function (Config, Log, Util, WalletSelectCtrl, WalletFilterListView, WalletModel, WalletStore, Message, html) {
    var STRING = {
        PAGE_TITLE: "提现记录 "
    };
    var DEF_SELECT_IDX = 4;

    var withdrawListModel = WalletModel.WalletWithdrawListSearch.getInstance();

    //restype: 1：处理中的记录；    2：成功的记录；    3：失败的记录；    4：部分成功；
    var itemTemplate =
        '<li class="J_ListRow" data-rfno=<%= rfno %>>' +
            '<div class="mb2"><span><%= bankname %><%= cardname %></span> <span class="fr"><i class="font12">￥</i><%= amt %></span></div>' +
            '<div class="font12 grey2"><span><%= smdateShort %></span> ' +
                '<span class="fr ' +
                '<% if(restype == 1){%>' +
                    'cff9300' +
                '<% } else if(restype == 2 || restype == 4){%>' +
                    'fr' +
                '<% } else if(restype == 3){%>' +
                    'cf00' +
                '<%}%>' +
                '">' +
                '<%= restypeUI %>' +
            '</span></div>' +
        '</li>';

    /*var itemTemplate1 =
        '<tr class="' +
                '<% if(restype == 3){%>' +
                'bcf8 grey ' +
                '<%}%>' +
                'J_ListRow" data-rfno=<%= rfno %>>' +
            '<td width="28%" class="font12"><%= smdateShort %></td>' +
            '<td width="40%"><div class=' +
                '<% if(restype != 3){%>' +
                'cblack' +
                '<%}%>' +
                '><%= banknameShort %></div>' +
                '<div class="font13 grey2 ellips"><span>' +
                '<%= cardtypeUI %>' + ' ' +
                '</span><%= cardno %></div>' +
            '</td>' +
            '<td align="right" width="32%">' +
                '<div><dfn>&#165; </dfn><%= amt %></span></div>' +
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
        */

    var View = WalletFilterListView.extend({
        citybtn: STRING.PAGE_TITLE,
        tpl: html,
        //backToPage: 'transacthistory',
        //scroll view variables-------
        itemTemplate: itemTemplate, //abstract --must--
        //----------------------------
        selectData: [{ nameMenu: '成功', nameTitle: '成功 ', data: 2 },
                     { nameMenu: '失败', nameTitle: '失败 ', data: 3 },
                     { nameMenu: '处理中', nameTitle: '处理中 ', data: 1 },
                     { nameMenu: '部分成功', nameTitle: '部分成功 ', data: 4 },
                     { nameMenu: '全部', nameTitle: '提现记录 ', data: 0 }],
        selectIdx: DEF_SELECT_IDX,
        onCreate: function () {
            this.model = withdrawListModel;
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
            //if (this.refererPage == 'withdrawdetail') {
            //    this.clearDataOnHide = false;
            //} else {
            //    this.clearDataOnHide = true;
            //}
        },
        onListRowClick: function (e) {
            this.inherited(arguments);

            var rfno = $(e.currentTarget).attr('data-rfno');
            var item = _.findWhere(this.modelDataList, { rfno: rfno });

            var detailStore = WalletStore.WithdrawDetailStore.getInstance();
            detailStore.set(item);
            this.forward('withdrawdetail');
            //this.forwardWithRetView('withdrawdetail', this.viewname + '?selectidx=' + this.selectIdx);
        },
        setModelParam: function () {
            this.model.param.restype = this.selectData[this.selectIdx].data; //0：全部记录 1：处理中的记录 2：成功的记录 3：失败的记录
            this.model.param.lastrfno = this.lastrfno;
            this.model.param.wdtype = 0;//0：所有类型；1：普通提现；2：定向提现；
        }
    });

    return View;
});
