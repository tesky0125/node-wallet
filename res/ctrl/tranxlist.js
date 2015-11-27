/**
* @author wxm
* @desc:  Wallet V5.8
*/

define(['Config', 'Log', 'Util', 'WalletSelectCtrl', 'WalletFilterListView', 'WalletModel', 'WalletStore', 'Message', 'text!tranxlist_html'],
function (Config, Log, Util, WalletSelectCtrl, WalletFilterListView, WalletModel, WalletStore, Message, html) {
    var STRING = {
        PAGE_TITLE: "收支明细 "
    };
    var DEF_SELECT_IDX = 2;

    var tradeListSearchModel = WalletModel.WalletTradeListSearch.getInstance();

    var itemTemplate =
        '<tr class="J_ListRow" data-rfno=<%= rfno %>>' +
            '<td width="20%"><%= traname %></td>' +
            '<td width="25%"><%= tradate %></td>' +
            '<td align="right" width="55%">' +
                '<% if(flows == 1){%>' +
                '<div class="cshou">+<dfn>' +
                '<%} else {%>' +
                '<div class="czhi">-<dfn>' +
                '<%}%>' +
                '&#165; </dfn><%= traamt %></span></div>' +
                '<div class="grey font12">余额 <dfn>&#165;</dfn><%= cash %></span></div>' +
            '</td>' +
        '</tr>';

    var View = WalletFilterListView.extend({
        citybtn: STRING.PAGE_TITLE,
        tpl: html,
        //backToPage: 'transacthistory',
        //scroll view variables-------
        itemTemplate: itemTemplate, //abstract --must--
        //----------------------------
        selectData: [{ nameMenu: '收入', nameTitle: '收入 ', data: 1 },
                     { nameMenu: '支出', nameTitle: '支出 ', data: 2 },
                     { nameMenu: '全部', nameTitle: '收支明细 ', data: 0 }],
        selectIdx: DEF_SELECT_IDX,
        onCreate: function () {
            this.model = tradeListSearchModel;
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
            //if (this.refererPage == 'transactdetail') {
            //    this.clearDataOnHide = false;
            //} else {
            //    this.clearDataOnHide = true;
            //}
        },
        onListRowClick: function (e) {
            this.inherited(arguments);

            var rfno = e.currentTarget;
            this.forward('transactdetail?rfno=' + $(rfno).attr('data-rfno'));
            //this.forwardWithRetView('transactdetail?rfno=' + $(rfno).attr('data-rfno'), this.viewname + '?selectidx=' + this.selectIdx);
        },
        setModelParam: function () {
            this.model.param.trasrc = 0; //"0：所有来源；1：钱包现金余额；2：携程钱包；3：礼品卡；"
            this.model.param.flows = this.selectData[this.selectIdx].data; //0：全部；1：收入；2：支出；
            this.model.param.lastrfno = this.lastrfno;
        }
    });

    return View;
});
