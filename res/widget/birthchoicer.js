/**
 * @module birthchoicer
 * @author yanjj
 * @version wallet V6.10
 * @description choice birth
 */
define(['UIGroupSelect','Util'], function(UIGroupSelect, Util) {
    var STRING = {
        SELECT_BIRTH: '选择日期'
    };
    var BirthChoicer = function(options){
        this.target = options.target;
        this.callback = options.callback;
        this.initialize();
    };
    BirthChoicer.prototype = {
        initialize:function(){
            var that = this;
            var birthData = this.birthData = this._getBirthData();

            var now = this.getCurrentDate();
            var arrNow = now ? now.split('-') : [];
            var arrIndex = [arrNow[0]-1900, arrNow[1]-1, arrNow[2]-1];//initial date

            this.birthGroupSelect = new UIGroupSelect({
                data: [birthData.yearData, birthData.monthData, birthData.dayData],
                indexArr: [arrIndex[0], arrIndex[1], arrIndex[2]],
                datamodel: {
                    title: STRING.SELECT_BIRTH,
                    tips: ''
                },
                onOkAction: function (items) {
                    var yearItem, monthItem, dayItem;
                    year = items[0].id;
                    month = Util.zeroize(items[1].id);
                    day = Util.zeroize(items[2].id);
                    var str = year + '年' + month + '月' + day + '日';
                    that.target.val(str);
                    var dateObj = {
                        year:year,
                        month:month,
                        day:day
                    }
                    that.callback(dateObj);
                    this.hide();
                },
                onCancelAction: function () {
                    this.hide();
                }
            });
        },
        getCurrentDate:function(){
            var date = new Date();
            var year = date.getFullYear();
            var mon = Util.zeroize(date.getMonth() + 1);
            var day = Util.zeroize(date.getDate());
            return year+'-'+mon+'-'+day;
        },
        show: function () {

            var birthArray = this.target.val().split('-');

            this.birthGroupSelect.show();
            if (birthArray.length == 3) {
                this.birthGroupSelect.scrollArr[0].setId(birthArray[0]);
                this.birthGroupSelect.scrollArr[1].setId(birthArray[1]);
                this.birthGroupSelect.scrollArr[2].setId(birthArray[2]);
                this._yearOrMonthChanged(this.birthGroupSelect.scrollArr[0].getSelected(), this.birthGroupSelect.scrollArr[1].getSelected());
            }
        },
        hide: function(){
            this.birthGroupSelect.hide();
        },
        //当年或者月改变后，日期需要判断闰年，或者日期变化的行为
        _yearOrMonthChanged : function (yearItem, monthItem) {
            var dayData = this.birthData.dayData;
            //处理month的时候日应该有所变化
            var dayFlag = { 1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };
            //闰年处理，需要先获取年份
            if (_.dateUtil.isLeapYear(yearItem.id)) {
                dayFlag[2] = 29;
            }
            var changed = false;
            //此处重置日期接口，并且需要重置“天”的dom结构
            for (var i = 0; i < 31; i++) {
                //设置该项不可选取
                dayData[i].disabled = true;
            }
            for (i = 31; i > dayFlag[monthItem.id] && i > 0; i--) {
                dayData[i - 1].disabled = false;
                changed = true;
            }
            if (changed) {
                this.birthGroupSelect.scrollArr[2].reload(dayData);
            }
        },
        _getBirthData: function () {
            var i, len, item;
            var _now = new Date();
            var _year = _now.getFullYear();
            var yearData = [];
            var monthData = [];
            var dayData = [];
            len = _year - 1900 + 1;
            for (i = 0; i < len; i++) {
                item = {
                    id: 1900 + i,
                    name: (1900 + i) + '年'
                };
                yearData.push(item);
            }
            for (i = 0; i < 12; i++) {
                item = {
                    id: 1 + i,
                    name: ((1 + i) < 10 ? ('0' + (1 + i)) : (1 + i)) + '月'
                };
                monthData.push(item);
            }
            for (i = 0; i < 31; i++) {
                item = {
                    id: 1 + i,
                    name: ((1 + i) < 10 ? ('0' + (1 + i)) : (1 + i)) + '日'
                };
                dayData.push(item);
            }
            return {
                yearData: yearData,
                monthData: monthData,
                dayData: dayData
            };
        }
    };
    return BirthChoicer;
});