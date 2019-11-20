import BaseComponent from "../Base/BaseComponent";
import DataMgr from "../Base/DataMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TouchController extends BaseComponent {

    @property(cc.Node)
    moveTouchNode : cc.Node = null;
    @property(cc.Node)
    shootNode : cc.Node = null;
    @property(cc.Node)
    spBg : cc.Node = null;
    @property
    moveSensi : number = 2;
    @property(cc.AudioClip)
    shootAudio : cc.AudioClip = null;

    public isMoving : Boolean = false;

    // LIFE-CYCLE CALLBACKS:

    start () {

    }

    onLoad () {
        var self = this;
        var canvas  = cc.find("Canvas");
        // var winSize = canvas.getComponent(cc.Canvas).winSize;
       // var winSize = cc.winSize;
        var mapMgr = canvas.getComponent("MapMgr");
        var spBgSize = cc.size(mapMgr.max_w,mapMgr.max_h);
        this.moveSensi = 0.4 * DataMgr.getInstance().opSetting.sensi;
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
    }

    public onShootCallBack(_event:any, customEventData:any)  {
        this.shootNode.getComponent("ShootController").shootTarget();
        cc.audioEngine.playEffect(this.shootAudio,false);
    }

    // update (dt) {}
}
