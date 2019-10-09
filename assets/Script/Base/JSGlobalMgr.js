// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.vv = {} //存储游戏全局的东西
        //cc.vv.sceneParam = {};   //游戏场景参数，全局，用作场景间参数传递
        cc.vv.i18n = require('LanguageData');//注意运行时必须保证 i18n.init(language) 在包含有 LocalizedLabel 组件的场景加载前执行
        cc.vv.encrypt = require("encryptjs");
        var ADMgr = require("./AdMgr");
        cc.vv.adMgr = new ADMgr();
    },
});
