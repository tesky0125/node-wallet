/**
 * @module getcerlist
 * @author chen.yun
 * @version since Wallet V6.10
 */

define(['WalletModel', 'WalletStore'], function(WalletModel, WalletStore) {

    var certListStore = WalletStore.CertListStore.getInstance();
        var realCertListStore = WalletStore.RealCertListStore.getInstance();
    var certListModel = WalletModel.QueryCertList.getInstance();

    /**
     * @description contructor
     * @param isRealName是否为实名认证页面
     * @param getPaymchid获取商户号
     * @param function callback  
     */
    var exports = function(param) {
        this.page=param.page;
        this.isRealName = param.isRealName;
        this.callback = param.callback;
        this.getPaymchid = param.getPaymchid;
        this.cerlist=param.cerlist||'';
        this._init();
    };

    exports.prototype = {
        _init: function() {
            this.getCertListModel();
        },
        getCertListModel: function() {
            if (this.isRealName) {
                var _data = realCertListStore.get();
            } else {
                var _data = certListStore.get();
            }
            if (_data) {
                this.cerlist=_data.idtypelist;
                this.callback && this.callback.call(this,this.cerlist);
            } else {
                certListModel.param = {};
                certListModel.param.reqtype = 1; //1：证件类型
                if (this.getPaymchid) {
                    certListModel.param.paymchid = this.getPaymchid;
                }
                if (this.isRealName) {
                    certListModel.param.src = '1';
                }else{
                    certListModel.param.src = '0';
                }
                this.page.loading.show();
                certListModel.exec({
                    scope: this,
                    suc: function(data) {
                        this.page.loading.hide();
                        this.page.procRcCode(data);
                        if (data.rc == 0) {
                            this.cerlist=data.idtypelist;
                            this.callback && this.callback.call(this,this.cerlist);
                        }
                    },
                    fail: function(data) {
                        this.page.onModelExecFail();
                    }
                });
            }
        },
        
        getCertList:function(){
            return this.cerlist;
        }

    };

    return exports;
});