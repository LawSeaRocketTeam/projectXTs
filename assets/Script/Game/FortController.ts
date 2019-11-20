import BaseComponent from "../Base/BaseComponent";
import DataMgr from "../Base/DataMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FortController extends BaseComponent {

    public id:number = 0;
    public cfgFortData : any = null;
    public hp:number = 0;
    public arrPos:number[] = [];
    public pos:cc.Vec2 = cc.v2(0,0)
    // onLoad () {}

    start () {

    }

    public init(_id:number){
        this.id = _id;
        this.cfgFortData = DataMgr.getInstance().getFortCfgDataById(_id);
        this.hp = this.cfgFortData.fortHp;
        let arrPos = this.cfgFortData.fortPos.split(',');
        let pos = cc.v2(arrPos[0],arrPos[1]);
        this.node.setPosition(pos);
    }

    // update (dt) {}

    public onCollisionEnter(other:any, self:any) {
        //被碰撞后,扣除一滴血
        this.hp -= 1;
        if(this.hp == 0){
            //出发游戏结束
            //cc.vv.gameNode.emit("event_game_jiesuan",{isSucc:false});
            this.emitEvent("event_game_jiesuan",{isSucc:false});
        }
    }
}
