import BaseComponent from "../Base/BaseComponent";
import TargetsMgr from "./TargetsMgr";

const {ccclass, property} = cc._decorator;

//地图管理器，管理添加在地图上的精灵
//把4000 * 2000的地图划分成块区域，每一块为 400 * 250
//划成块是便于对驻留怪生成的管理，对移动怪无效

@ccclass
export default class MapMgr extends BaseComponent {

    @property
    max_w: number = 4000;   //可移动总宽
    @property
    max_h: number = 2000;   //可移动总高
    @property
    block_w: number = 125;   //设置的大小要跟地图的宽整除
    @property
    block_h: number = 125;   //设置的大小要跟地图的高整除
    @property
    block_gen_count: number = 4;   //每个块最多生成
    @property(cc.Node)
    shootNode: cc.Node = null;
    @property(cc.Node)
    spbg: cc.Node = null;

    public targetsMgr : TargetsMgr = null;
    public arrBlocks : any[] = [];
    public blockHCount : number = 0;
    public blockWCount : number = 0;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var canvas = cc.find("Canvas")
        this.targetsMgr = canvas.getComponent("TargetsMgr");
        this.arrBlocks = [];    //存储块的数组
        this.blockHCount = Math.floor(this.max_h / this.block_h);
        this.blockWCount = Math.floor(this.max_w / this.block_w);
        //扩大地图大小，避免在高分别率机器看到边界
        //this.spbg.width = this.max_w * 1.5;
        //this.spbg.height = this.max_h * 1.5;
        for(let i = 0;i < this.blockHCount; i++){
            for(let j = 0; j < this.blockWCount; j++){
                let block = {pos : cc.v2(0,0),targets :[] };
                block.pos = cc.v2(-this.max_w/2 + j*this.block_w,-this.max_h/2 + i*this.block_h);
                block.targets = [];
                this.arrBlocks.push(block);
            }
        }
        //cc.director.getCollisionManager().enabled = true;
        //console.log("map block = \n" +JSON.stringify(this.arrBlocks));
    }

    start () {

    }

    // update (dt) {}
}
