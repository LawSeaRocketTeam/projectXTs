//广告管理器
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:
    ctor : function() {

    },

    loadRewardedVideoAd : function(_id){
        if (cc.sys.OS_ANDROID == cc.sys.os) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage", "loadRewardedVideoAd", "(Ljava/lang/String;)V",_id);
            //cc.vv.msgBox.show(cc.vv.curNode,"广告播放")
        }
        console.log("loadRewardedVideoAd")
    },

    showRewardedVideo : function(){
        if (cc.sys.OS_ANDROID == cc.sys.os) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage", "showRewardedVideo", "()V");
           // cc.vv.msgBox.show(this.node,"广告播放")
        }
        console.log("showRewardedVideo")
    },

    onRewarded : function(){
        //cc.vv.msgBox.show(cc.vv.curNode,"~~~~~~~~~~~~~~~onRewarded")
        console.log("~~~~~~~~~~~~~~~~~~~~~onRewarded")
    },

    onRewardedVideoAdLeftApplication : function() {
       // cc.vv.msgBox.show(cc.vv.curNode,"~~~~~~~~~~~~~~~onRewardedVideoAdLeftApplication")
       console.log("~~~~~~~~~~~~~~~~~~~~~onRewardedVideoAdLeftApplication")
    },

    onRewardedVideoAdClosed : function() {
       // cc.vv.msgBox.show(cc.vv.curNode,"~~~~~~~~~~~~~~~onRewardedVideoAdClosed")
       console.log("~~~~~~~~~~~~~~~~~~~~~onRewardedVideoAdClosed")
    },

    onRewardedVideoAdFailedToLoad : function (_errorCode) {
       // cc.vv.msgBox.show(cc.vv.curNode,"~~~~~~~~~~~~~~~onRewardedVideoAdFailedToLoad")
       console.log("~~~~~~~~~~~~~~~~~~~~~onRewardedVideoAdFailedToLoad")
    },

    onRewardedVideoAdLoaded : function() {
       // cc.vv.msgBox.show(cc.vv.curNode,"~~~~~~~~~~~~~~~onRewardedVideoAdLoaded")
       console.log("~~~~~~~~~~~~~~~~~~~~~onRewardedVideoAdLoaded")
    },  

    onRewardedVideoAdOpened : function() {
       // cc.vv.msgBox.show(cc.vv.curNode,"~~~~~~~~~~~~~~~onRewardedVideoAdOpened")
       console.log("~~~~~~~~~~~~~~~~~~~~~onRewardedVideoAdOpened")
    },


    onRewardedVideoStarted : function() {
       // cc.vv.msgBox.show(cc.vv.curNode,"~~~~~~~~~~~~~~~onRewardedVideoStarted")
       console.log("~~~~~~~~~~~~~~~~~~~~~onRewardedVideoStarted")
    },

    onRewardedVideoCompleted : function() {
       // cc.vv.msgBox.show(cc.vv.curNode,"~~~~~~~~~~~~~~~onRewardedVideoCompleted")
       console.log("~~~~~~~~~~~~~~~~~~~~~onRewardedVideoCompleted")
    },

    // update (dt) {},
});
