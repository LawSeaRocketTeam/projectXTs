import BaseComponent from "../Base/BaseComponent";
import TargetsMgr from "./TargetsMgr";
import Common from "../Common/Common";
import TargetController from "../Game/TargetController";

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
        this.emitEvent("map_load_finish");
    }

    //获取该块九宫格内一个空闲的块(-1,+1,-blockWCount,+blockWCount,0,-blockWCount+1,blockWCount-1,-blockWCount-1,blockWCount+1)
    /**
     *          bw-1   bw    bw+1 
     *          -1     0     +1
     *         -bw-1  -bw   -bw+1
     */
    //如果该点九宫格内的格都满了，则取九宫内其中一点再取下去
    //_range 当range是1则是九宫格范围，当设定range>1就更多了
    private _getNearEmptyBlockIdx(_idx:number,_range:number = 1){
        //let tmp = [-1,1,-this.blockWCount,this.blockWCount,0,-this.blockWCount+1,this.blockWCount-1,-this.blockWCount-1,this.blockWCount+1];
        let tmp = [];
        let row = 2*_range + 1; //一共有多少行，且行数=列数
        let initNum = -this.blockWCount*_range - _range;
        for(let i = 0; i < row; i++){
            let v = initNum + i*this.blockWCount;
            for(let j = 0; j < row; j++){
                tmp.push(v + j);
            }
        }      
        //随机打乱数组，造成每次取的相邻顺序都不一样
        //打乱两次，让它乱一点
        for(let i = 0; i < 3; i++){
            tmp.sort(function(){
                let rand = Math.random();
                //console.log("_getNearEmptyBlockIdx rand = " + rand);
                return rand > 0.5 ? -1:1;})
        }
        //console.log("----------------tmp array = " + tmp);
        for(let v of tmp){
            let nearIdx = _idx + v;
            if(nearIdx >= this.arrBlocks.length || nearIdx < 0){
                continue;
            }
            if(this.arrBlocks[nearIdx].targets.length == 0){
                return nearIdx;
            }
        }
        //如果一个都找不到，找相邻节点的九宫格
        return this._getNearEmptyBlockIdx(_idx + tmp[0]);
    }

    //获取靠近距离块指定距离的目标块
    //添加生成方向是因为考虑到时随机生成的，不能控制到生成的范围，所以从配置表取生成方向后再随机，那么包围堡垒看起来更平均
    //_idx : 指定块下标
    //_dis ：指定距离
    //_dir : 生成方向 1上 2左 3下 4右
    private _getEmptyBlockIdxByDis(_idx:number,_dis:number,_dir:number){
        let tmp = [];
        let row = Math.floor(_dis / this.block_h);
        let line = Math.floor(_dis / this.block_w);
        
        switch(_dir){
            case 1:
                {
                    let initNum = _idx-this.blockWCount*row-line;
                    for(let i = 0; i < 2*line; i++){
                        tmp.push(initNum + i);
                    }
                }
                break;
            case 2:
                {
                    let initNum = _idx-this.blockWCount*row-line;
                    for(let i = 0; i < 2*row; i++){
                        tmp.push(initNum + i * this.blockWCount);
                    }
                }
                
                break;
            case 3:
                {
                    let initNum = _idx+this.blockWCount*row-line;
                    for(let i = 0; i < 2*line; i++){
                        tmp.push(initNum + i);
                    }
                }
                break;
            case 4:
                {
                    let initNum = _idx-this.blockWCount*row+line;
                    for(let i = 0; i < 2*row; i++){
                        tmp.push(initNum + i * this.blockWCount);
                    }
                }
                break;
        }
        //随机打乱数组，造成每次取的相邻顺序都不一样
        //打乱两次，让它乱一点
        for(let i = 0; i < 3; i++){
            tmp.sort(function(){
                let rand = Math.random();
                //console.log("_getNearEmptyBlockIdx rand = " + rand);
                return rand > 0.5 ? -1:1;})
        }
        //console.log("----------------tmp array = " + tmp);
        for(let v of tmp){
            let nearIdx = v;
            if(nearIdx >= this.arrBlocks.length || nearIdx < 0){
                continue;
            }
            if(this.arrBlocks[nearIdx].targets.length == 0){
                return nearIdx;
            }
        }
        //如果一个都找不到，返回-1
        return -1;
    }

    //获取地图上某个点所在的块下标
    public getPointInBlockIdx(_pos){
        for(let i = 0; i < this.arrBlocks.length; i++){
            let block = this.arrBlocks[i];
            let bRect = cc.rect(block.pos.x,block.pos.y,this.block_w,this.block_h);
            if(bRect.contains(_pos)){
                return i;
            }
        }
        return -1;
    }

    //在指定的区块生成半径为_radius的指定最大数量为_count的目标
    //当空间不够时，生成数会少于_count
    //_type:目标类型
    //_activeTime 对于短期驻留怪，存活时间
    //_genDipTime 在同一块区生成多个时，间隔多久生成1个,默认0
    //ret 返回生成了多少个目标
    public generateTargetsInBlockByIdx(_id:number,_idx:number,_radius:number,_count:number,_type:number,_activeTime:number = -1,_genDipTime:number = 0,_direction:number = 0,_speed:number = 0){
        let block = this.arrBlocks[_idx];
        let hasGenCount = 0;
        //初始化布局数组
        //理论上应该是每个坐标点创建的,因为生成半径没有太小，节省计算量，所以除以10了
        let position = new Array();
        for(let i = 0; i < this.block_w; i++){
            position[i]=new Array();
            for(let j = 0; j < this.block_h; j++){
                //isPlanted:是否需要新建 isSet：是否已经设置
                position[i][j] = {radius:0,isPlanted:0,isSet:0};
            }
        }
        //往position中添加块里本来已经有的目标
        for(let k in block.targets){
            let node = block.targets[k];
            let targetController = node.getComponent("TargetController");
            let x = node.x - block.pos.x
            let y = node.y - block.pos.y
            position[x][y] = {radius:targetController.radius,isPlanted:0,isSet:1}
        }
        //最大半径
        let targetRadiusMax = _radius;
        //会用10倍随机点去生成对应数
        for(let i = 0; i < _count * 10; i++){
            //在合适的范围，随机选择一个位置来做圆心，最好画出来的圆不能超过区块
            //
            let targetX = Common.getInstance().randomFrom(targetRadiusMax,this.block_w - targetRadiusMax);
            let targetY = Common.getInstance().randomFrom(targetRadiusMax,this.block_h - targetRadiusMax);
            if(position[targetX][targetY].isSet == 1){
                //如果该位置已经生成目标则跳过后续操作
                continue;
            }
            //半径随机
            //let targetRadius = targetRadiusMax * Math.random();
            //targetRadius = Math.max(10,treeRadius);//保持一个最小值
            //position[targetX][targetY].radius = targetRadius;
            let targetRadius = _radius;
            //初始设定可以生成
            position[targetX][targetY].radius = targetRadius;
            position[targetX][targetY].isPlanted = 1;
            let checkStartX = Math.max(targetX - Math.ceil(targetRadius) - targetRadiusMax,0);
            let checkStartY = Math.max(targetY - Math.ceil(targetRadius) - targetRadiusMax,0);
            let checkEndX = Math.min(targetX + Math.ceil(targetRadius) + targetRadiusMax,this.block_w);
            let checkEndY = Math.min(targetY + Math.ceil(targetRadius) + targetRadiusMax,this.block_h);
            for(let x = checkStartX; x < checkEndX; x++){
                for(let y = checkStartY; y < checkEndY; y++){
                    if((targetX == x && targetY == y) == false){
                        //比较两点间距离和两点半径和的大小 判断是否重叠
                        let targetDistanceSquared = (targetX - x) * (targetX - x) + (targetY - y) * (targetY - y);
                        let radiusSumSquared = (position[x][y].radius + targetRadius) * (position[x][y].radius + targetRadius);
                        if(targetDistanceSquared < radiusSumSquared){
                            //发生碰撞则标记不可生成
                            if(position[x][y].radius != 0){
                                //防止那些在圆内的点被误认为是碰撞点
                                position[targetX][targetY].radius = 0;
                                position[targetX][targetY].isPlanted = 0;
                            }
                        }
                    }
                }
            }
            if(position[targetX][targetY].isPlanted == 1){
                position[targetX][targetY].isSet = 1;
                hasGenCount++;
                let delayTime = hasGenCount * _genDipTime;
                
                let target = this.targetsMgr.getIdleTarget();
                let targetController = target.getComponent("TargetController");
                targetController.setBlock(block);   //把对象往block里面添加
                targetController.setId(_id);
                this.scheduleOnce(function() {
                    //生成目标
                    let x = block.pos.x + targetX;
                    let y = block.pos.y + targetY;
                    //let tc = target.getComponent("TargetController");
                    targetController.refresh(_type,cc.v2(x,y),_radius,_activeTime,_speed,_direction);
                    target.parent = this.spbg
                }.bind(this), delayTime);
            }
            //当到达数量后，则可退出循环
            if(hasGenCount == _count) break;
        }
        return hasGenCount;
    }

    //在射击点九宫内寻找空白块生成驻守目标
    //_activeTime 对于短期驻留怪，存活时间
    //_genDipTime 在同一块区生成多个时，间隔多久生成1个,默认0
    public generateTermTargetsNearShootPos(_id:number,_radius:number,_count:number,_type:number,_activeTime:number = -1,_genDipTime:number = 0){
        let shootCtrl = this.shootNode.getComponent("ShootController");
        let pos = shootCtrl.getShootPoint();
        let shootBlockIdx = this.getPointInBlockIdx(pos); 
        let hasGen = 0
        while(hasGen < _count)
        {
            //1-3随机范围可以是九宫格，可以使25宫格
            let range = Common.getInstance().randomFrom(1,3);
            let nearBlockIdx = this._getNearEmptyBlockIdx(shootBlockIdx,range);
            if(nearBlockIdx != -1){ 
                let genCount = _count - hasGen < this.block_gen_count ? _count - hasGen : this.block_gen_count
                hasGen += this.generateTargetsInBlockByIdx(_id,nearBlockIdx,_radius,genCount,_type,_activeTime,_genDipTime);
            }
        }
    }

    //生成堡垒
    public generateFort(_id:number){
        let fort = this.targetsMgr.getFortTarget(_id);
        fort.parent = this.spbg;
        return fort;
    }

    //在距离堡垒中心点指定距离外生成靠近堡垒目标
    //_radius : 目标半径
    //_speed : 速度
    //_fortPos : 堡垒坐标
    //_fortDis : 距离堡垒距离
    //_dir : 生成方向 1上 2左 3下 4右
    public generateAttFortTargetNearFort (_id:number,_radius:number,_speed:number,_fortPos:cc.Vec2,_fortDis:number,_dir:number){
        let fortBlockIdx = this.getPointInBlockIdx(_fortPos);
        let nearBlockIdx = this._getEmptyBlockIdxByDis(fortBlockIdx,_fortDis,_dir)
        if(nearBlockIdx != -1){
            let vec = _fortPos.sub(this.arrBlocks[nearBlockIdx].pos);
            this.generateTargetsInBlockByIdx(_id,nearBlockIdx,_radius,1,Common.TargetType.AttFort,-1,0,Common.getInstance().vectorsToDegress(vec),_speed);
        }
    }

    //创建移动类型目标
    //p1:目标类型
    //P2:目标半径大小
    //P3：速度 像素/秒
    //p4: 位置
    //P5：移动方向
    public generateTarget (_type:number,_radius:number,_speed:number,_pos:cc.Vec2,_dirDeg:number):TargetController{
        _dirDeg = _dirDeg || Common.getInstance().randomFrom(0,360);
        let shootCtrl = this.shootNode.getComponent("ShootController");
        let pos = _pos;
        var target = this.targetsMgr.getIdleTarget();
        var targetController = target.getComponent("TargetController");
        targetController.refresh(_type,pos,_radius,-1,_speed,_dirDeg);
        target.parent = this.spbg
        return targetController;
    }

    //创建移动类型目标
    //p1:目标类型
    //P2:目标半径大小
    //P3：速度 像素/秒
    //p4: 围绕射击点多少像素范围内生成
    //P5：移动方向
    public generateMoveTargetNearShootPos(_type:number,_radius:number,_speed:number,_genRange:number,_dirDeg:number = 0):TargetController{      
        _genRange = _genRange || 300;
        let shootCtrl = this.shootNode.getComponent("ShootController");
        let pos = shootCtrl.getShootPoint();
        let xDip = Common.getInstance().seededRandom(-_genRange,_genRange,true);
        let yDip = Common.getInstance().seededRandom(-_genRange,_genRange,true);
        pos = cc.v2(pos.x + xDip,pos.y + yDip);
        return this.generateTarget(_type,_radius,_speed,pos,_dirDeg);
    }

    // update (dt) {}
}
