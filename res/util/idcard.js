/**
 * @module idcard
 * @author yanjj
 * @version since Wallet V6.7
 * @description verify china id card
 */
define([], function () {

    var exports = {};

    /*验证是否有效的中国身份证号码*/
    var isValidChinaIDCard = function (sNo) {
        sNo = sNo.toString().replace(/\s/g, '');
        if (sNo.length == 18) {
            var a, b, c;
            if (!isInteger(sNo.substr(0, 17))) {
                return false;
            }

            a = parseInt(sNo.substr(0, 1)) * 7 + parseInt(sNo.substr(1, 1)) * 9 + parseInt(sNo.substr(2, 1)) * 10;
            a = a + parseInt(sNo.substr(3, 1)) * 5 + parseInt(sNo.substr(4, 1)) * 8 + parseInt(sNo.substr(5, 1)) * 4;
            a = a + parseInt(sNo.substr(6, 1)) * 2 + parseInt(sNo.substr(7, 1)) * 1 + parseInt(sNo.substr(8, 1)) * 6;
            a = a + parseInt(sNo.substr(9, 1)) * 3 + parseInt(sNo.substr(10, 1)) * 7 + parseInt(sNo.substr(11, 1)) * 9;
            a = a + parseInt(sNo.substr(12, 1)) * 10 + parseInt(sNo.substr(13, 1)) * 5 + parseInt(sNo.substr(14, 1)) * 8;
            a = a + parseInt(sNo.substr(15, 1)) * 4 + parseInt(sNo.substr(16, 1)) * 2;
            b = a % 11;

            if (b == 2) {
                c = sNo.substr(17, 1).toUpperCase();
            }
            else {
                c = parseInt(sNo.substr(17, 1));
            }

            switch (b) {
                case 0: if (c != 1) { return false; } break;
                case 1: if (c != 0) { return false; } break;
                case 2: if (c != "X") { return false; } break;
                case 3: if (c != 9) { return false; } break;
                case 4: if (c != 8) { return false; } break;
                case 5: if (c != 7) { return false; } break;
                case 6: if (c != 6) { return false; } break;
                case 7: if (c != 5) { return false; } break;
                case 8: if (c != 4) { return false; } break;
                case 9: if (c != 3) { return false; } break;
                case 10: if (c != 2) { return false }
            }
        }
        else {
            if (!isInteger(sNo)) { return false; }
        }

        switch (sNo.length) {
            case 15: if (isValidDate(sNo.substr(6, 2), sNo.substr(8, 2), sNo.substr(10, 2))) { return true; }; break;
            case 18: if (isValidDate(sNo.substr(6, 4), sNo.substr(10, 2), sNo.substr(12, 2))) { return true; }
        }
        return false;
    };

    /*判断是否是整型*/
    var isInteger = function (sNum) {
        var num;
        num = new RegExp('[^0-9_]', '');
        if (isNaN(sNum)) {
            return false;
        }
        else {
            if (sNum.search(num) >= 0) {
                return false;
            }
            else {
                return true;
            }
        }
    };

    /*判断是否有效的年月日*/
    var isValidDate = function (iY, iM, iD) {
        var udf;
        if (iY != udf && !isNaN(iY) && iY >= 0 && iY <= 9999 &&
            iM != udf && !isNaN(iM) && iM >= 1 && iM <= 12 &&
            iD != udf && !isNaN(iD) && iD >= 1 && iD <= 31) {
            if (iY < 50)
                iY = 2000 + iY;
            else if (iY < 100)
                iY = 1900 + iY;
            if (iM == 2 && (isLeapYear(iY) && iD > 29 || !isLeapYear(iY) && iD > 28) ||
                iD == 31 && (iM < 7 && iM % 2 == 0 || iM > 7 && iM % 2 == 1))
                return false;
            else
                return true;
        }
        else
            return false;
    };

    var isLeapYear = function (iYear) {
        var udf;
        if (iYear != udf && !isNaN(iYear) && iYear > 0 && (iYear % 4 == 0 && iYear % 100 != 0 || iYear % 400 == 0)) {
            return true;
        }
        else {
            return false;
        }
    };

    exports.isValidChinaIDCard = isValidChinaIDCard;

    return exports;
});