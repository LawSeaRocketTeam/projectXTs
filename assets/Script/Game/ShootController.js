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
        radius:30,
        spBg:cc.Node,
    },

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
    },

    start () {
        this.refresh();
    },

    refresh : function(){
        this.shootCount = 0;    //射击次数
        this.hitCount = 0;      //命中次数
        this.comboCount = 0;    //连击次数
        this.comboMaxCount = 0; //最大连击次数
        this.killTargetCount = 0;   //杀敌数
        this.reactionTime = [];   //最长反应时间
        this.perfectShootCount = 0; //完美设计次数
        this.canShoot = true;  //是否能够进行射击
    },

    //获取当前射击点在地图上的位置
    getShootPoint : function(){
        //先把标靶节点转换成世界坐标
        let posWorld = this.node.convertToWorldSpaceAR(this.node.position);
        //把世界坐标转换成在spBG上的坐标
        let posConverSpBg = this.spBg.convertToNodeSpaceAR(posWorld);
        return posConverSpBg;
    },

    //射击
    shootTarget : function(){
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
       cc.vv.gameNode.emit("game_set_hitrate")
    },

    setCanShoot : function(_value){
        this.canShoot = _value
    },

    //
    killTarget:function(){
        this.killTargetCount++;

    },

    getHitRate : function(){
        if(this.shootCount != 0){
            return Math.floor(this.hitCount / this.shootCount * 100);
        }
        else{
            return 0;
        }
    },

    getReactionTime : function(){
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

    // update (dt) {},
});
