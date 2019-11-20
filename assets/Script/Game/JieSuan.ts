import BaseComponent from "../Base/BaseComponent";
import GlobalMgr from "../Base/GlobalMgr";
import DataMgr from "../Base/DataMgr";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class JieSuan extends BaseComponent {

    @property(cc.Label)
    lbCoin: cc.Label = null;
    @property(cc.Label)
    lbKill: cc.Label = null;
    @property(cc.Label)
    lbRate: cc.Label = null;
    @property(cc.Label)
    lbCombo: cc.Label = null;
    @property(cc.Label)
    lbReaction: cc.Label = null;
    @property(cc.Label)
    lbName: cc.Label = null;
    @property(cc.Node)
    nCoin: cc.Node = null;
    @property(cc.Node)
    shootNode: cc.Node = null;
    @property(cc.Node)
    btReChallenge: cc.Node = null;
    @property(cc.Node)
    btNext: cc.Node = null;

    // onLoad () {}

    start () {

    }

    public showJieSuan(_isSucc:boolean,_guanId:number){
        this.node.active = true;
        let gqCfgData = DataMgr.getInstance().getGuanQiaCfgDataById(_guanId);
        if(_isSucc){
            this.lbName.string = cc.vv.i18n.t("js_success");
            this.nCoin.active = true;
            if(DataMgr.getInstance().checkGuanQiaIsPassBefore(_guanId))
                this.lbCoin.string = (gqCfgData.goldAward * 0.1).toString();
            else
            this.lbCoin.string = gqCfgData.goldAward;
            this.btNext.active = true;
            this.btReChallenge.active = false;
        }
        else{
            this.lbName.string = cc.vv.i18n.t("js_failed")
            this.nCoin.active = false;
            this.lbCoin.string = "0";
            this.btNext.active = false;
            this.btReChallenge.active = true;
        }
        let shootCtrl = this.shootNode.getComponent("ShootController");
        this.lbKill.string = shootCtrl.killTargetCount;
        this.lbRate.string = shootCtrl.getHitRate() + "%";
        this.lbCombo.string = shootCtrl.comboMaxCount;
        this.lbReaction.string = shootCtrl.getReactionTime() + "s"
    }

    public onMenuClick(event:any, customEventData:any){ 
        this.node.active = false;  
        cc.director.loadScene("loginScene");
    }

    public onNextClick(event:any, customEventData:any){
        this.node.active = false;
        //获取下一关Id，并全局设置
        GlobalMgr.getInstance().sceneParam.id = DataMgr.getInstance().getNextGuanQiaIdById(GlobalMgr.getInstance().sceneParam.id)
        //cc.vv.gameNode.emit("game_refresh");
        this.emitEvent("game_refresh");
    }

    public onRechallengeClick(event:any, customEventData:any){
        this.node.active = false;
        this.emitEvent("game_refresh");
    }

    // update (dt) {}
}
