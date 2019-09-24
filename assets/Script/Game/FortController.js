
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    init : function(_id){
        this.id = _id;
        this.cfgFortData = cc.vv.dataMgr.getFortCfgDataById(_id);
        this.hp = this.cfgFortData.fortHp;
        let arrPos = this.cfgFortData.fortPos.split(',');
        let pos = cc.v2(arrPos[0],arrPos[1]);
        this.node.setPosition(pos);
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    onCollisionEnter: function (other, self) {
        //被碰撞后,扣除一滴血
        this.hp -= 1;
        if(this.hp == 0){
            //出发游戏结束
            cc.vv.gameNode.emit("event_game_jiesuan",{isSucc:false});
        }
    },
});
 