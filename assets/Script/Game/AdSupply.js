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
        lbSupply : cc.Label,
        lbDesc : cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        //this.shootCtrl = this.shootNode.getComponent("ShootController");
    },

    /**
     * 显示看广告补给提醒
     * _type:补给类型 1.时间 2.子弹 3.生命
     * _value:补给数量
     */
    showAdSupply : function(_type,_count){
        let strSupply = "";
        let strDesc = ""
        //确定类型和数量后，这里先准备好视频
        if(_type == 1){
            strSupply = cc.vv.i18n.t("ad_add_time");
            strDesc = cc.vv.i18n.t("ad_des_time");
            cc.vv.adMgr.loadRewardedVideoAd("ca-app-pub-3940256099942544/5224354917");
        }
        else if(_type == 2){
            strSupply = cc.vv.i18n.t("ad_add_bullet");
            strDesc = cc.vv.i18n.t("ad_des_bullet");
            cc.vv.adMgr.loadRewardedVideoAd("ca-app-pub-3940256099942544/5224354917");
        }
        else if(_type == 3){
            strSupply = cc.vv.i18n.t("ad_add_heart");
            strDesc = cc.vv.i18n.t("ad_des_heart");
            cc.vv.adMgr.loadRewardedVideoAd("ca-app-pub-3940256099942544/5224354917");
        }
        strSupply = Common.stringFormat(strSupply,_count);
        strDesc = Common.stringFormat(strDesc,_count);
        lbSupply.string = strSupply;
        lbDesc.string = strDesc;
    },

    onPlayClick:function(event, customEventData){ 
        cc.vv.adMgr.showRewardedVideo();
    },
});
