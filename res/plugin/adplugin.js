/**
 * @author      wxm      Wallet V6.8
 * @description wallet plugin widget
 */

define(['cGuiderService', 'UIAdImageSlider', 'Config', 'WalletModel', 'CacheData'],
    function(cGuiderService, UIAdImageSlider, Config, WalletModel, CacheData) {

        var globalAdModel = WalletModel.GlobalAdSearchModel.getInstance();

        var exports = function(param) {
            _.extend(this, param);
        };

        var translate = false;//QQbrowser and UC browser have some https->http image issue

        exports.prototype = {
            render: function() {
                this._getGlobalAdSearch();
            },
            adjAdHeight: function() {
                this.view.$el.find(this.selector).trigger('resize'); //sometime ad not shown, trigger resize to show it
            },
            //private functions bellow...
            _showImgSlider: function() {
                if (this.imageSlider) {
                    this.imageSlider.show();
                    if (this._numAdCount <= 1) {
                        this.imageSlider.scroll.destroy();
                    }
                }

                setTimeout(_.bind(function() {
                    this.adjAdHeight();
                }, this), 1000); //wait ctrip menu is shown
            },
            _showAdRow: function(result, size) {
                var self = this;
                var selector = this.selector;

                this.view.$el.find(selector).replaceWith(this.tpl);
                this._bannerWrap = this.view.$el.find(selector);

                var ht = CacheData.getAdRowHeight() ? CacheData.getAdRowHeight() : '62px';

                if (this.animate) {
                    this._bannerWrap.animate({
                        height: ht
                    }, 250, function() {
                        setTimeout(function() {
                            self._showImgSlider();
                            self._bannerWrap.addClass('cm-fade-in');
                            setTimeout(function() {
                                self._bannerWrap.removeClass('cm-fade-in ');
                            }, 500);
                        }, 300);
                    });
                } else {
                    this._bannerWrap.css({
                        height: ht
                    });
                    setTimeout(function() {
                        self._showImgSlider();
                    }, 100);
                }
                self._initImgSlider(result, size);
            },
            _getGlobalAdSearch: function() {
                var self = this;

                self._setGlobalAdParam();

                globalAdModel.exec({
                    suc: function(data) {
                        var ads = data.Ads,
                            result = [],
                            len = Math.min(ads.length, 10),
                            size = {};

                        self._numAdCount = 0; //pic count in ad control
                        len && _.each(ads, function(ad, i) {
                            var adParams = ad.ADContentLists;

                            if (ad && adParams && adParams.HasValidAdvertisement) {

                                if (_.isEmpty(size)) {
                                    size = {
                                        width: adParams.Width,
                                        height: adParams.Height
                                    };
                                }

                                self._numAdCount++;

                                if(self.translate) {
                                    translate = self.translate;
                                }

                                if(translate){
                                    adParams.SrcUrl = adParams.SrcUrl.replace(/http:\/\//i, 'https://');
                                }

                                result.push({
                                    id: i + 1,
                                    src: $.trim(adParams.SrcUrl ? adParams.SrcUrl : ''),
                                    url: adParams.LinkUrl ? adParams.LinkUrl : '',
                                    positionId: self._getQueryParam(adParams.LoadTrackUrl, 's'),
                                    adId: self._getQueryParam(adParams.LoadTrackUrl, 'a')
                                });
                            }
                        });

                        !self.imageSlider && result.length && self._showAdRow(result, size);
                    },
                    fail: function(data) {
                        //clear height cache on fail
                        self.view.$el.find(self.selector).css({
                            height: '0px'
                        });
                    },
                    scope: self
                });
            },
            /**
             * @description 从一个给定的url字符串中获取查询参数
             * @param url
             * @param key
             * @returns {string}
             */
            _getQueryParam: function(url, key) {
                key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
                    results = regex.exec(url);

                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            },
            _setAdHeight: function() {
                var screenWidth = $('body').offset().width;

                this._size.width && this._size.height && this._bannerWrap.height(screenWidth * this._size.height / this._size.width + 'px !important');
                CacheData.setAdRowHeight(screenWidth * this._size.height / this._size.width + 'px');
            },
            _initImgSlider: function(data, size) {
                var self = this;

                self._size = size;
                size && size.width && size.height && self._setAdHeight();
                self.imageSlider = new UIAdImageSlider({
                    datamodel: {
                        data: data,
                        itemFn: function(item) {
                            var src = item.src;
                            return '<img data-src="' + src + '" data-url="' + src + '" src="' + src + '">';
                        }
                    },
                    needLoop: self._numAdCount > 1 ? true : false,
                    sliderNav: self._numAdCount > 1 ? undefined : $('<div/>'),
                    autoPlay: self._numAdCount > 1 ? true : false,
                    displayNum: 1,
                    showNav: true,
                    pageId: self.view[Config.IS_INAPP ? 'hpageid' : 'pageid'],
                    wrapper: self._bannerWrap,
                    itemClick: function(e) {
                        e && e.url && self._jumpToPage(e.url);
                    }
                });

                $(window).on('resize', function() {
                    self._setAdHeight();
                });
            },
            _setGlobalAdParam: function( /*cid*/ ) {
                var self = this,
                    param = {},
                    cinfo;

                if (Config.IS_INAPP) {
                    cinfo = JSON.parse(localStorage.CINFO);

                    param.ChannelID = cinfo.sourceId;
                    param.SystemCode = cinfo.systemCode;
                    param.GlobalBusinessInfo = {
                        BizType: 24,
                        PageCode: 1,
                        ClientVersion: cinfo.cver
                    };
                    param.DeviceInfo = {
                        ScreenWidth: cinfo.screenWidth,
                        ScreenHeight: cinfo.screenHeight,
                        DeviceOSVersion: cinfo.deviceOSVersion,
                        ScreenPxDensity: cinfo.screenPxDensity
                    };
                } else {
                    param.ChannelID = '8888'; //byl卞奕龙 13:42  是的 只要营销的人不改动就是8888
                    param.SystemCode = '9';
                    param.GlobalBusinessInfo = {
                        BizType: 24,
                        PageCode: 1
                    };
                    param.DeviceInfo = {
                        ScreenWidth: window.innerWidth * (window.devicePixelRatio || 1)
                    };
                }
                globalAdModel.setParam(param);
            },
            /**
             * 跳到指定页
             */
            _jumpToPage: function(url) {
                if (!url) {
                    return;
                }

                //check wallet pages
                //hybrid should link to h5, because h5 page is always up-to-date!
                if (!Config.IS_HYBRID) {
                    var s = url.split("\/webapp\/wallet\/");
                    if (s[1]) {
                        //internal wallet page
                        this.view.forward(s[1]);
                        return;
                    }
                }

                //check electronic bill
                if (url.match(/.*webapp\/ElectronicBill.*/i)) {
                    url = url + '?from=' + encodeURIComponent(location.href);
                }

                //general pages
                if (!Config.IS_INAPP) {
                    this.view.jump(url);
                } else {
                    var isNative = url.match(/^ctrip:\/\//i);
                    cGuiderService.jump({
                        targetModel: isNative ? 'app' : 'h5',
                        url: url //title: document.title
                    });
                }
            }
        };

        return exports;
    });