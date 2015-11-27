define(['cShell', 'WalletStore', 'cUtilHybrid', 'cHybridShell'], function(cShell, WalletStore, cUtilHybrid, cHybridShell) {
    var shareInfoStore = WalletStore.ShareInfoStore.getInstance()
    var exports = function(param) {
        this.opt = {
            imgUrl: param.imgUrl || '',
            sinaImg: param.sinaImg || '',
            title: param.title || '',
            text: param.text || '',
            linkUrl: param.linkUrl || ''
        };
        shareInfoStore.setAttr("shareInfo", this.opt);
        this._init();
    };

    exports.prototype = {
        _init: function() {
            if (cUtilHybrid.isInWeichat) {
                this._weiChatShare()
            }
        },
        hybirdShare: function() {
            var shareInfo = shareInfoStore.getAttr("shareInfo");
            var dataList = [{
                shareType: "Default",
                imageUrl: shareInfo.imgUrl,
                text: shareInfo.text,
                title: shareInfo.title,
                linkUrl: shareInfo.linkUrl
            }, {
                shareType: "SMS",
                text: shareInfo.text,
                linkUrl: shareInfo.linkUrl
            }, {
                shareType: "SinaWeibo",
                imageUrl: shareInfo.sinaImg,
                message: shareInfo.text,
                linkUrl: shareInfo.linkUrl
            }, {
                shareType: "Copy",
                text: shareInfo.text,
                linkUrl: shareInfo.linkUrl
            }];
            cHybridShell.Fn('call_custom_share', function(json_obj) {}).run(dataList);
        },
        _weiChatShare: function() {
            var shareInfo = shareInfoStore.getAttr("shareInfo");
            var options = {
                title: shareInfo.title,
                desc: shareInfo.text,
                href: shareInfo.linkUrl,
                icon: shareInfo.imgUrl
            };
            cShell.share(options).done(function() { /* 分享成功 */ }).fail(function(err) { /* 分享失败 */ });
        }
    };
    return exports;
});