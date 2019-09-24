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
        moveTouchNode : cc.Node,
        shootNode:cc.Node,
        spBg : cc.Node,
        moveSensi : 2,      //移动灵敏度
        shootAudio: {
            default: null,
            type: cc.AudioClip
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var self = this;
        var canvas  = cc.find("Canvas");
        // var winSize = canvas.getComponent(cc.Canvas).winSize;
        var winSize = cc.winSize;
        var mapMgr = canvas.getComponent("MapMgr");
        var spBgSize = cc.size(mapMgr.max_w,mapMgr.max_h);
        this.moveSensi = 0.4 * cc.vv.dataMgr.opSetting.sensi;
        self.moveTouchNode.on(cc.Node.EventType.TOUCH_START,function(event){
            let touches = event.getTouches();
            let touchLoc = touches[0].getLocation();
            self.isMoving = true;
        },self.moveTouchNode);

        self.moveTouchNode.on(cc.Node.EventType.TOUCH_MOVE,function (event){
            let touches = event.getTouches();
            let touchLoc = touches[0].getLocation();
            let pre_touchLoc = touches[0].getPreviousLocation();
            let delta = touches[0].getDelta();
            let bgPos = self.spBg.position;
            //console.log("preBgPos : " + bgPos);
            //边界限定
            let x = self.spBg.x - self.moveSensi * delta.x;
            let y = self.spBg.y - self.moveSensi * delta.y;
            if(x < -spBgSize.width/2){
                x = -spBgSize.width/2;       
            }
            else if(x > spBgSize.width/2){
                x = spBgSize.width/2;
            }
            if(y < -spBgSize.height/2){
                y = -spBgSize.height/2;
            }
            else if(y > spBgSize.height/2){
                y = spBgSize.height/2;
            }
            bgPos = cc.v2(x,y);
            //console.log("aftBgPos : " + bgPos);
            self.spBg.position = bgPos;
            //console.log("touchLoc : " + touchLoc);
            //console.log("pre_touchLoc : " + pre_touchLoc);
            //console.log("delta : " + delta);
        },self.moveTouchNode);

        self.moveTouchNode.on(cc.Node.EventType.TOUCH_END, function (event) {
            self.isMoving = false; // when touch ended, stop moving
        }, self.moveTouchNode);

        // self.shootTouchNode.on('click',function(){
        //     console.log("shootTouchNode click");
        // },self)
    },

    onShootCallBack: function(_event, customEventData)  {
        this.shootNode.getComponent("ShootController").shootTarget();
        cc.audioEngine.playEffect(this.shootAudio,false);
    },
    // update (dt) {},
});
