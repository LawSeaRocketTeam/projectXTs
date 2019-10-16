import BaseComponent from "../Base/BaseComponent";
import TargetsMgr from "./TargetsMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ShootControl extends BaseComponent {

    @property
    radius: number = 30;
    @property(cc.Node)
    spBg: cc.Node = null;
    
    targetsMgr : TargetsMgr = null;
    shootCount : number = 0;    //射击次数
    hitCount : number = 0;      //命中次数
    comboCount : number = 0;    //连击次数
    comboMaxCount : number = 0; //最大连击次数
    killTargetCount : number = 0;   //杀敌数
    reactionTime : number[] = [];   //最长反应时间
    perfectShootCount : number = 0; //完美设计次数
    canShoot : Boolean = true;  //是否能够进行射击
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.targetsMgr = cc.find("Canvas").getComponent("TargetsMgr");
        //画靶心
        var g = this.getComponent(cc.Graphics);
        var r = this.radius
        var d = 2 * r;
        g.lineWidth = 2;
        g.strokeColor.fromHEX('#ff0000');    
        //g.circle(0, 0, r);
        //g.stroke();
        g.moveTo(-r, 0);
        g.lineTo(r, 0);
        g.stroke();
        g.moveTo(0, -r);
        g.lineTo(0, r);
        g.stroke();
        g.close();
    }

    start () {
        this.refresh();
    }

    public refresh(){
        this.shootCount = 0;    //射击次数
        this.hitCount = 0;      //命中次数
        this.comboCount = 0;    //连击次数
        this.comboMaxCount = 0; //最大连击次数
        this.killTargetCount = 0;   //杀敌数
        this.reactionTime = [];   //最长反应时间
        this.perfectShootCount = 0; //完美设计次数
        this.canShoot = true;  //是否能够进行射击
    }

    //获取当前射击点在地图上的位置
    public getShootPoint(){
        //先把标靶节点转换成世界坐标
        let posWorld = this.node.convertToWorldSpaceAR(this.node.position);
        //把世界坐标转换成在spBG上的坐标
        let posConverSpBg = this.spBg.convertToNodeSpaceAR(posWorld);
        return posConverSpBg;
    }

    //射击
    public shootTarget(){
        if(!this.canShoot)
            return
        //检测射击点是否在目标内
        this.shootCount++;
        let shootParam = this.targetsMgr.checkTargetsBeShoot(this.getShootPoint())
        if(shootParam.beShoot){
            this.hitCount++;
            this.comboCount++;
            this.reactionTime.push(shootParam.reactionTime)
            if(this.comboMaxCount < this.comboCount){
                this.comboMaxCount = this.comboCount;
            }
            if(shootParam.isPerfect){
                this.perfectShootCount++;
            }
       }
       else{
           this.comboCount = 0
       }
       //cc.vv.gameNode.emit("game_set_hitrate")
       this.emitEvent("game_set_hitrate");
    }

    public setCanShoot(_value:Boolean){
        this.canShoot = _value
    }

    //
    public killTarget(){
        this.killTargetCount++;

    }

    public getHitRate(){
        if(this.shootCount != 0){
            return Math.floor(this.hitCount / this.shootCount * 100);
        }
        else{
            return 0;
        }
    }

    public getReactionTime(){
        let sumTime = 0;
        if(this.reactionTime.length == 0){
            return 0;
        }
        for(let v of this.reactionTime){
            sumTime += v;
        }
        sumTime /= this.reactionTime.length;
        return (sumTime / 1000).toFixed(2);
    }

    // update (dt) {}
}
