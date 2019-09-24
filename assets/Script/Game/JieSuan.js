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
        lbCoin : cc.Label,
        lbKill : cc.Label,
        lbRate : cc.Label,
        lbCombo : cc.Label,
        lbReaction : cc.Label,
        lbName : cc.Label,
        nCoin : cc.Node,
        shootNode : cc.Node,
        btReChallenge : cc.Node,
        btNext : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        //this.shootCtrl = this.shootNode.getComponent("ShootController");
    },

    showJieSuan : function(_isSucc,_guanId){
        this.node.active = true;
        let gqCfgData = cc.vv.dataMgr.getGuanQiaCfgDataById(_guanId);
        if(_isSucc){
            this.lbName.string = cc.vv.i18n.t("js_success");
            this.nCoin.active = true;
            if(cc.vv.dataMgr.checkGuanQiaIsPassBefore(_guanId))
                this.lbCoin.string = gqCfgData.goldAward * 0.1;
            else
            this.lbCoin.string = gqCfgData.goldAward;
            this.btNext.active = true;
            this.btReChallenge.active = false;
        }
        else{
            this.lbName.string = cc.vv.i18n.t("js_failed")
            this.nCoin.active = false;
            this.lbCoin.string = 0;
            this.btNext.active = false;
            this.btReChallenge.active = true;
        }
        let shootCtrl = this.shootNode.getComponent("ShootController");
        this.lbKill.string = shootCtrl.killTargetCount;
        this.lbRate.string = shootCtrl.getHitRate() + "%";
        this.lbCombo.string = shootCtrl.comboMaxCount;
        this.lbReaction.string = shootCtrl.getReactionTime() + "s"
    },

    onMenuClick:function(event, customEventData){ 
        this.node.active = false;  
        cc.director.loadScene("loginScene");
    },

    onNextClick:function(event, customEventData){
        this.node.active = false;
        //获取下一关Id，并全局设置
        cc.vv.sceneParam.id = cc.vv.dataMgr.getNextGuanQiaIdById(cc.vv.sceneParam.id)
        cc.vv.gameNode.emit("game_refresh");
    },

    onRechallengeClick:function(event, customEventData){
        this.node.active = false;
        cc.vv.gameNode.emit("game_refresh");
    },

    // update (dt) {},
});
