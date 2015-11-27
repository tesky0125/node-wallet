/**
 * @module walletLoading
 * @author alivechen
 * @description walletLoading
 * @version since Wallet V6.4
 */

define([], function() {
    function WalletLoading() {
        this._isShow = true;
    };
    WalletLoading.prototype = {
        _loadingDiv: function() {
            var load = '<div class="view cui-layer" style="z-index: 3002; margin-left: -5px; margin-top: -5px;" id="ID_WLT_LOAD">' + '<div class="cp-h5-main">' + '<div class="loading-box2">' + '<div class="loading-layer2">' + '游游努力加载中...' + '<div class="loading-cycle"></div></div></div></div></div>';
            return load;
        },
        _loadingMask: function() {
            var mask = '<div class="view cui-mask"  id="ID_WLT_MSK"></div>';
            return mask;
        },
        show: function() {
            if (!this._isShow) {
                $('#ID_WLT_LOAD').show(),
                    $('#ID_WLT_MSK').show();
                this._position();
            } else {
                var _lDiv = this._loadingDiv();
                var _lMask = this._loadingMask();
                $(document.body).append(_lMask);
                this._position();
                $(document.body).append(_lDiv);
                this._isShow = false;
            }
        },
        _position: function() {
            var htMask = Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight /* - htSelect*/ ) + 'px';
            //$("#ID_WLT_MSK").css('height', htMask);
            $('#ID_WLT_MSK').css({
                'position': 'absolute',
                'top': '0',
                'left': '0',
                'width': '100%',
                'height': htMask,
                'z-index': ' 3001'
            })
        },
        hide: function() {
            $('#ID_WLT_LOAD').hide();
            $('#ID_WLT_MSK').hide();
        }
    };

    window.addEventListener('resize', function(event) {
        var m = $("#ID_WLT_MSK");

        if (m && m.length && m.css("display") != "none") {
            var htMask = Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight /* - htSelect*/ ) + 'px';
            m.css('height', htMask);
        }
    });

    return new WalletLoading();
});