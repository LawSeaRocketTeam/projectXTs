//游戏里面所有数据存储管理的的地方

var encrypt = require("encryptjs");
var secretkey = "project_x_20190809"
var OP_SETTING_NAME = "OP_SETTING_NAME"
var GUANQIA_DATA_NAME = "GUANQIA_DATA"


cc.Class({
    extends: cc.Component,

    ctor : function() {
        this.opSetting = {op:0,sensi:5}; //操作设置
        this.gameSetting = {};  //游戏设置
        let opSettingData = cc.sys.localStorage.getItem(OP_SETTING_NAME);
        if(opSettingData != undefined){
            opSettingData = JSON.parse(encrypt.decrypt(opSettingData,secretkey,256));
            this.opSetting.op = opSettingData.op;
            this.opSetting.sensi = opSettingData.sensi;
        }
        //读取关卡配置
        var self = this;
        cc.loader.loadRes('config/GuanQia', function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            self.configGuanQiaData = data.json.children;
            //游戏用户关卡数据
            let gqData = cc.sys.localStorage.getItem(GUANQIA_DATA_NAME);
            if(gqData != undefined){
                self.guanQiaData = JSON.parse(encrypt.decrypt(gqData,secretkey,256));
            }
            else{
                //如果是空,则添加关卡的第一个集合
                self.guanQiaData = [];
                self.addGuanQiaUtil(1);
            }
        });
        cc.loader.loadRes('config/Monster', function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            self.configMonsterData = data.json;
        });
        cc.loader.loadRes('config/Man', function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            self.configManData = data.json;
        });
        cc.loader.loadRes('config/Fort', function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            self.configFortData = data.json;
        });
        cc.loader.loadRes('config/Supply', function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            self.configSupplyData = data.json;
        });
        cc.loader.loadRes('config/uMonsterId', function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            self.configUmonsters = data.json;
        });
        cc.loader.loadRes('config/movepos', function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            self.configMovePosUtil = data.json;
        });
    },

    //存储操作模式
    saveOpSetting : function(_op,_sensi){
        this.opSetting.op = _op;
        this.opSetting.sensi = _sensi;
        let jsonData = JSON.stringify(this.opSetting);
        let encryData = encrypt.encrypt(jsonData,secretkey,256);
        cc.sys.localStorage.setItem(OP_SETTING_NAME,encryData);
    },

    //添加关卡集合初始数据
    //_idx : 关卡集合下标
    //ret : 添加是否成功
    addGuanQiaUtil : function(_idx){
        let guankaCfgUtil = this.getGuanKaUtilByIdx(_idx);
        if(guankaCfgUtil.length == 0)
            return false
        let util = [];
        for(let i = 0; i < 10; i++){
            let item = {star:-1};
            if(i == 0){
                item.star = 0;
            }
            util.push(item);
        }
        this.guanQiaData.push(util);
        return true;
    },

    //根据关卡ID判断该关卡是否之前已经成功通过
    checkGuanQiaIsPassBefore : function(_id){
        let page = Math.floor(_id / 1000);
        let guan = Math.floor((_id - page * 1000) / 10);
        let star = Math.floor(((_id - page * 1000) - guan * 10));
        let util = this.guanQiaData[page-1];
        let item = util[guan-1];
        if(item.star >= star)
            return true;
        else
            return false;
    },

    //通过ID保存数据
    saveGuanQiaById :function(_id){
        let page = Math.floor(_id / 1000);
        let guan = Math.floor((_id - page * 1000) / 10);
        let star = Math.floor(((_id - page * 1000) - guan * 10));
        let util = this.guanQiaData[page-1];
        let item = util[guan-1];
        item.star = star;
    },


    //命令手段添加
    cmdGuanQiaSave : function(_id){
        let page = Math.floor(_id / 1000);
        let guan = Math.floor((_id - page * 1000) / 10);
        let star = Math.floor(((_id - page * 1000) - guan * 10));
        let util = this.guanQiaData[page-1];
        let item = util[guan-1];
        item.star = star-1;
    },

    //存储关卡数据到文件
    saveGuanQiaData : function(){
        let jsonData = JSON.stringify(this.guanQiaData);
        let encryData = encrypt.encrypt(jsonData,secretkey,256);
        cc.sys.localStorage.setItem(GUANQIA_DATA_NAME,encryData);
    },

    //根据下标(页面)获取一个关卡集
    getGuanKaUtilByIdx : function(_idx){
        let utils = [];
        for(let k in this.configGuanQiaData){
            let v = this.configGuanQiaData[k];
            let x = Math.floor(v.gId / 1000);
            if(x == _idx){
                utils.push(JSON.parse(JSON.stringify(v)));
            }
        }
        return utils;
    },

    //根据关卡ID获取配置中的关卡数据
    getGuanQiaCfgDataById : function(_gid){
        for(let k in this.configGuanQiaData){
            let v = this.configGuanQiaData[k];
            if(v.gId == _gid){
                return JSON.parse(JSON.stringify(v));
            }
        }
        return undefined;
    },

    //根据当前关卡ID获取下一关关卡ID
    getNextGuanQiaIdById : function(_curGid){
        for(let k in this.configGuanQiaData){
            let k = parseInt(k);
            let v = this.configGuanQiaData[k];
            if(v.gId == _curGid){
                if(k + 1 < this.configGuanQiaData.length){
                    let nextV = this.configGuanQiaData[k + 1]
                    return nextV.gId;
                }
            }
        }
        return -1;
    },

    //根据怪物的集合ID获取怪物集合
    getMonsterCfgDataByUid : function(_uid){
        let monsters = [];
        for(let k in this.configUmonsters.children){
            let v = this.configUmonsters.children[k];
            if(v.uMonsterId == _uid){
                //monsters.push(v);
                let monstersId = [];
                if(v.type == 1){
                    monstersId = String(v.monsterId).split(',');
                }   
                else if(v.type == 2){
                    let tmp = v.monsterId.split(';');
                    for(let id of tmp)
                    {
                        let mc = id.split(',');
                        for(let i = 0; i < parseInt(mc[1]); i++ ){
                            monstersId.push(mc[0]);
                        }
                    }
                }
                for(let id of monstersId){
                    for(let i in this.configMonsterData.children){
                        let md = this.configMonsterData.children[i];
                        if(md.monsterId == id){
                            //需要对JSON进行深度克隆,直接使用md会出现相同ID的使用了同一份数据
                            //这种深度克隆只能针对纯数据的，对于有方法在里面的，会被忽略，要注意
                            let newMd = JSON.parse(JSON.stringify(md));
                            monsters.push(newMd);
                        }
                    }
                }
                break;
            }
        }
        return monsters;
    },

    //根据怪物ID获取怪物数据
    getMonsterCfgDataById : function(_id){
        for(let k in this.configMonsterData.children){
            let md = this.configMonsterData.children[k];
            if(md.monsterId == _id){
                return JSON.parse(JSON.stringify(md));
            }
        }
    },

    //根据平民的集合ID获取平民集合
    getMenCfgDataByUid : function(_uid){
        let men = [];
        for(let k in this.configManData.children){
            let v = this.configManData.children[k];
            if(v.uManId == _uid){
                men.push(JSON.parse(JSON.stringify(v)));
            }
        }
        return men;
    },

    //根据补给的集合ID获取补给集合
    getSupplyCfgDataByUid : function(_uid){
        let supply = [];
        for(let k in this.configSupplyData.children){
            let v = this.configSupplyData.children[k]
            if(v.uSuplyId == _uid){
                supply.push(JSON.parse(JSON.stringify(v)));
            }
        }
        return supply;
    },

    //根据ID获取位置数据
    getMovPosCfgDataById : function(_id){
        for(let k in this.configMovePosUtil.children){
            let v = this.configMovePosUtil.children[k]
            if(v.movePosID == _id){
                return JSON.parse(JSON.stringify(v));
            }
        }
        return undefined;
    },

    //根据堡垒ID获取堡垒数据
    getFortCfgDataById : function(_id){
        for(let k in this.configFortData.children){
            let v = this.configFortData.children[k]
            if(v.fortId == _id){
                return JSON.parse(JSON.stringify(v));
            }
        }
        return undefined;
    },
});
