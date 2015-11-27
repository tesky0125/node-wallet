/**
* @module walletlistpageview
* @author luzx
* @description wall scroll list view for all page.
* @version since Wallet V5.7 
*/

define(['WalletPageView', 'WalletModel', 'Config', 'Message'], function (WalletPageView, WalletModel, Config, Message) {


    var moreLoading =  '<div class="J_More more-loading p10 cui-text-center">'+
    '<span class="cui-pro-load">'+
    '<span class="cui-pro-radius"></span>'+
    '<span class="cui-i cui-pro-logo"></span>'+
    '</span>'+
    '<span class="grey2">加载中</span>'+
    '</div>';

    var noMoreLoading = '<div class="J_Nomore nomore">没有更多结果了</div>';

    var getMore = '<div class="J_Getmore nomore">加载更多</div>';

    var DEFAULT_REQUEST_PAGE_NUM = 25;
    var udf;
    
    var WalletListViewPage = WalletPageView.extend({
        /**
        * @description abstract -- optional-- default is true. if auto load data on first page load
        */
        autoGetData: true,
        /**
        * @description abstract --must--
        */
        itemTemplate: null,
        /**
        * @description abstract --must--
        */
        itemContainter: null,
        /**
        * @description abstract --optional-- default is 25
        */
        requestNum: null,
        /**
        * @description abstract --must--
        */
        onButtomPull: null,
        /**
        * @description container for moreLoading or noMoreLoading
        */
        moreDivParent: null,
        /**
        * @description --option-- if true, wont bind drag event
        */
        requestOnlyOnce: false,
        /**
        * @description abstract -- optional-- default is true. if clear page data when view is hidden
        */
        clearDataOnHide: true,
        _currentPageNum: 0,
        _gettingData: false,
        _turning: false,
        _isFirstRequest: true,
        _currentScrollTop: 0,
        _moreLoadHtml: $(moreLoading),
        _noMoreLoadHtml: $(noMoreLoading),
        _getMoreHtml: $(getMore),
        onCreate: function () {
            this.inherited(arguments);
            this.render();
        },
        onShow: function () {
            this.inherited(arguments);
            this._bindEvent();
            if (this.autoGetData) {
                this._fireGetDataEvent();//it will be called at first time
            }            
        },
        onHide: function () {
            this.inherited(arguments);
            if (this.clearDataOnHide) {
                this.resetList();
            }
        },
        resetList: function () {
            this._removeEvent();
            this._clean();
        },
        /**
        * @description get data event
        */
        fireGetDataEvent: function() {
            this._fireGetDataEvent();
        },
        returnHandler: function (){
            this.inherited(arguments);
        },
        /**
        * @description this function will be trigger on bottom pull failed.
        */
        onButtomPullExecFail: function (data, callback) {
            if (!this._isFirstRequest) {//first request error not toast, because first request fail will show404
                //if (data && data.status && typeof (data.status) == 'number' && (data.status == 404 || data.status == 0)) {//client connection off
                if (data && typeof (data.head) == 'undefined' && typeof (data.rc) == 'undefined') { //no head and no rc, assert it's because of connection issue
                    this.showToast(Message.get(330));
                } else if (!data && Config.IS_INAPP) { //Hybrid: no data means no connection//
                    this.showToast(Message.get(330));
                }
            }
            callback(null, data);
        },
        _scrollEvent: function () {
            var that = this;
            console.log('scrolling');
            if ((document.body.scrollTop + window.screen.height) > document.body.scrollHeight - 500) {
                console.log('-------------------------------->>> ');
                if (this._showing404) {
                    return;
                }
                this._currentScrollTop = document.body.scrollTop;
                this._fireGetDataEvent();
            }
        },
        _bindEvent: function () {
            $(document).bind("scroll", _.bind(this._scrollEvent, this));
            $('.J_Getmore').live('click', _.bind(this._fireGetDataEvent,this));
        },
        _removeEvent: function () {
            $(document).unbind("scroll");
            $('.J_Getmore').off('click');
        },
        _showMoreLoading: function () {
            this._hideGetMoreHtml();
            this.moreDivParent.append(this._moreLoadHtml);
        },
        _hideMoreLoading: function (){
            this.moreDivParent.find('.J_More').remove();
        },
        _showGetMoreHtml: function () {
            this.moreDivParent.append(this._getMoreHtml);
        },
        _hideGetMoreHtml: function (){
            this.moreDivParent.find('.J_Getmore').remove();
        },
        _showNoMoreLoading: function () {
            this._hideGetMoreHtml();
            this.moreDivParent.append(this._noMoreLoadHtml);
        },
        _hideNoMoreLoading: function (){
            this.moreDivParent.find('.J_Nomore').remove();
        },
        // if your drag page at bottom of page, it will be fired 
        _fireGetDataEvent: function () {
            if (this._gettingData) {
                return;
            }

            console.log('requesting page');
            this._gettingData = true;
            var that = this;
            this.hide404();
            this.itemContainter.show();
            if (this._isFirstRequest) {
                this.loading.show();
            } else {
                this._showMoreLoading();
            }
            this.requestNum = this.requestNum || DEFAULT_REQUEST_PAGE_NUM;

            this.onButtomPull({
                currentPageNum: this._currentNum,
                requestNum: this.requestNum,
                firstRequest: this._isFirstRequest
            }, _.bind(this._getDataCallBack, this))
        },
        _getDataCallBack: function (items, data) {
            var that = this;

            this._gettingData = false;
            this._hideMoreLoading();
            this.loading.hide();
            
            if (!this._turning) {
                this._turning = true;
                this.turning();//it will atuomatily called at first callback
            }
            if (!items) {
                //error request
                if (this._isFirstRequest) {
                    console.log('_isFirstRequest: ' + this._isFirstRequest);
                    this.itemContainter.hide();
                    setTimeout(function () {
                        that.show404(function () {
                            that.hide404();
                            that._fireGetDataEvent();
                        }, that.getExecErrMsg(data));
                    }, 50);
                    console.log('request error!');
                    return;
                } else {
                    this._showGetMoreHtml();
                    return;
                }
            }
            console.log('request success!');

            this._isFirstRequest = false;

            this._addItems(items);
            this._showGetMoreHtml();

            var requestedItemLength = items.length;
            if (typeof requestedItemLength != udf) {
                this._currentPageNum += requestedItemLength;
                if (requestedItemLength < this.requestNum || this.requestOnlyOnce) {
                    this._taskFinish();
                }
            }            
            //$('.J_TrHead').css('position', 'absolute');
            //$('.J_TrHead').css('position', 'fixed');
            //$('.J_TrHead').css('top', '80px');
        },
        _addItems: function (items) {
            var that = this;
            var $frg = $(document.createDocumentFragment());
            _.each(items, function (item) {
                $frg.append(_.template(that.itemTemplate, item));
            });
            $(that.itemContainter).append($frg);
        },
        _taskFinish: function () {
            if (this._currentPageNum > this.requestNum) {//don't show "no more result" on first page request
                this._showNoMoreLoading();
            }
            this._removeEvent();
            this._hideGetMoreHtml();
        },
        _clean: function () {
            this._currentPageNum = 0;
            this._currentScrollTop = 0;
            this._turning = false;
            this._isFirstRequest = true;
            this._hideNoMoreLoading();
            this._hideGetMoreHtml();
            this.itemContainter.html('');
            
        }
    });
    return WalletListViewPage;
});

