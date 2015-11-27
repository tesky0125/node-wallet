/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['WalletModel', 'WalletStore', 'Util', 'Message','Config'],
function (WalletModel, WalletStore, Util, Message, Config) {

    var STRING = {
        
    };


    var localConfig = {
        
    };


    /*
        test data
        {
            bankname: '工商银行',
            cardname: '信用卡',
            cardno: '1122 33****44 ',
            srcamt: '1002.01',
            recvtext: '预计3个工作日',
            restype: 1
        }

        restype:
        1：处理中的记录；
        2：成功的记录；
        3：失败的记录
    */

    var module = {
        setData: function (data, option) {
            var option = option || {};
            option.firseLine = option.firseLine || '<li>提现至<span class="fr">金额(元)</span></li>';
            option.lastLine = option.lastLine || '';
            this.option = option;
            this.data = data || [];


        },
        getTemplate: function () {
            var option = this.option;
            var data = this.data;
            var $ul = $('<ul class="p0_10 cashtable"></ul>');
            $ul.append($(option.firseLine));
            
            for (var i = 0; i < data.length; i++) {
                var item = data[i];

                if(item.cardno){
                    item.cardno = '<span class="fl grey2">' + item.cardno + '</span>';
                }
                if (item.cardname) {
                    item.cardname = '<em class="cardclass2">' + item.cardname + '</em>';
                }

                var _restypeClass = '';
                if (item.restype) {
                    if (item.restype == 1) {
                        _restypeClass = 'green';
                    } else if (item.restype == 2) {
                        _restypeClass = 'grey';
                    } else if (item.restype == 3) {
                        _restypeClass = 'cf00';
                    } else {
                        _restypeClass = 'grey';
                    }
                } else {
                    _restypeClass = 'grey';
                }
                item.recvtext = Util.formatStr('<span class="{1}">', _restypeClass) + item.recvtext + '</span>';
                

                var $li = $('<li>');
                var html = '<div><span class="fr"><i class="font12">￥</i>' + item.srcamt + '</span>' + item.bankname + item.cardname + '</div>' +
                            '<div class="font12 t_r">' + item.recvtext + item.cardno + '</div>';
                $li.html(html);
                $ul.append($li);
            }

            $ul.append(option.lastLine);
            return $ul[0].outerHTML;
        }
    };

    return module;
});

