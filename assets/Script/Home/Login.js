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
        icon:cc.Node,
        operateSettingLayer : cc.Node,
        testSettingLayer : cc.Node,
        chooseLayer : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
         //需要设置一个全局的常驻节点保存全局数据，
         //如果数据只保存在一般场景中，每次返回场景都会重新初始化
         //因为都会重新执行ONLOAD这些函数
         let gNode = cc.find("GlobalNode");
         cc.game.addPersistRootNode(gNode);
     },

    start () {
        if(cc.vv.sceneParam.showLayer != undefined && cc.vv.sceneParam.showLayer == "opSetting")
        {
            this.operateSettingLayer.active = true;
        }
        else{
            this.operateSettingLayer.active = false;
        }
        this.chooseLayer.active = false;    
        this.testSettingLayer.active = false;
        let action1 = cc.moveTo(5,cc.v2(230,287));
        let action2 = cc.moveTo(5,cc.v2(-230,287));
        let action3 = cc.sequence(action1,action2);
        this.icon.runAction(cc.repeatForever(action3));

        cc.vv.adMgr.loadRewardedVideoAd("ca-app-pub-3940256099942544/5224354917");
    },

    // onEnable(){
    //     cc.vv.curNode = this.node;
    // },

    onGuanKaClick:function(event, customEventData){
        //cc.director.loadScene("gameScene");
        this.chooseLayer.active = true;
    },

    onWuJinClick:function(event, customEventData){
        cc.vv.msgBox.show(this.node,"尚未开启,敬请期待")
    },

    onOperaSettingClick:function(event, customEventData){
        this.operateSettingLayer.active = true;
    },

    onTestSettingClick : function(event, customEventData){
        this.testSettingLayer.active = true;
    },

    onAdTestClick : function(event, customEventData){
        cc.vv.adMgr.showRewardedVideo();
        console.log("onAdTestClick");
    }

    // update (dt) {},
});
