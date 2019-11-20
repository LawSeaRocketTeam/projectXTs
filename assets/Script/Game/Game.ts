import BaseComponent from "../Base/BaseComponent";
import TargetsMgr from "./TargetsMgr";
import ShootControl from "./ShootController";
import MapMgr from "./MapMgr";
import DataMgr from "../Base/DataMgr";
import Common from "../Common/Common";

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
export default class Game extends BaseComponent {

    @property(cc.Node)
    spBg: cc.Node = null;
    @property(cc.Node)
    shootNode: cc.Node = null;
    @property
    initCount: number = 4;   //初始化生成个数
    @property
    generateDelta: number = 1;   //每过多长时间生成1个

    public targetsMgr : TargetsMgr = null;
    public shootCtrl : ShootControl = null;
    public mapMgr : MapMgr = null;
    public jieSuanNode : cc.Node = null;
    public UINode : cc.Node = null;
    public btNode : cc.Node = null;
    public btBack : cc.Node = null;
    public introduceNode : cc.Node = null;
    public lbHitRate : cc.Label = null;
    public lbLimitTime : cc.Label = null;
    public ShootTouchLeftNode : cc.Node = null;
    public ShootTouchRightNode : cc.Node = null;
    public isGameInit : boolean = false
    public isJieSuaning : boolean = false;
    public gameLeiJiTime : number = 0;
    public testBackClick : boolean = false;
    public uMonsterCfgData : any[] = [];
    public limitTime = 0;
    public gqCfgData : any = null;
    public taskParam : any = null;
    public limitBullet : number = -1;
    public lbLimitMiss : cc.Label = null;
    public monsterRound : number = 0;
    public fortNode : cc.Node = null;
    public lbLimitBullet : cc.Label = null;
    public limitMiss : number = 0;
    public cfgFortData : any = null;
    public guanQiaId : number = 0;
    public uMenCfgData : any = null; //平民集配置数据
    public uSupplyCfgData : any = null;


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.targetsMgr = this.getComponent("TargetsMgr");
        this.shootCtrl = this.shootNode.getComponent("ShootController");
        this.mapMgr = this.getComponent("MapMgr");
        this.jieSuanNode = cc.find("Canvas/NodeJieSuan");
        this.UINode = cc.find("Canvas/UINode");
        this.btNode = cc.find("Canvas/Node_button");
        this.btBack = cc.find("bt_back",this.UINode);
        this.introduceNode = cc.find("Canvas/NodeIntroduce");
        this.lbHitRate = cc.find("Canvas/UINode/lb_hitValue").getComponent(cc.Label);
        //开启碰撞检测系统
        cc.director.getCollisionManager().enabled = true;
        //修改射击区域大小
        this.ShootTouchLeftNode = cc.find("Canvas/ShootTouchLeftNode");
        this.ShootTouchRightNode = cc.find("Canvas/ShootTouchRightNode");
        this.ShootTouchLeftNode.width = cc.winSize.width / 2;
        this.ShootTouchRightNode.width = cc.winSize.width / 2;
        //监听事件
        this.onEvent("event_game_jiesuan",this._on_game_jiesuan,this);
        this.onEvent("map_load_finish",this._mapLoadFinish,this);
        this.onEvent("game_all_targets_clear",this._allTargetClear,this);
        this.onEvent("game_set_hitrate",this._setHitRate,this);
        this.onEvent("game_kill_target",this._killTarget,this);
        this.onEvent("game_refresh",this._gameRefresh,this);
    }

    start () {
        if(DataMgr.getInstance().opSetting.op == 0){
            //左手准星
            this.ShootTouchLeftNode.active = true;
            this.ShootTouchRightNode.active = false;
        }
        else{
            //右手准星
            this.ShootTouchLeftNode.active = false;
            this.ShootTouchRightNode.active = true;
        }
        this.isGameInit = false;
        this.isJieSuaning = false;
        this.spBg.position = cc.v2(0,0);
        this.gameLeiJiTime = 0;
        this.testBackClick = false;
    }

    onEnable(){
        //cc.vv.curNode = this.node;
    }

    update (dt) {
        if(this.isGameInit && !this.isJieSuaning){
            this._updateMonsters(dt);
        }
    }

    //根据怪物的配置数据，对怪物的定期刷新
    private _updateMonsters(_dt:number){
        this.gameLeiJiTime += _dt;
        for(let k in this.uMonsterCfgData){
            let monsterData = this.uMonsterCfgData[k];
            if(monsterData.initGenTime > this.gameLeiJiTime * 1000){
                continue;
            }
            if(monsterData.updateDelta == undefined){
                //新增一个累计时间记录
                monsterData.updateDelta = 0;
                this._generateMonster(monsterData,50);
            }
            monsterData.updateDelta += _dt;
            if(monsterData.updateDelta > monsterData.refreshInteval && monsterData.refreshInteval != -1){
                //判断是否能同时存在
                if(monsterData.isCoexist){
                    //生成怪
                    this._generateMonster(monsterData,50);
                    //重置更新累计时间
                    monsterData.updateDelta = 0
                }
                else{
                    //判断场上是否有同类型怪
                    if(!this.targetsMgr.checkIsExistSameTypeTarget(monsterData.monsterId)){
                        //生成怪
                        this._generateMonster(monsterData,50);
                        //重置更新累计时间
                        monsterData.updateDelta = 0
                    }
                }
            }
        }
    }

    private _updateTimer(){
        if(this.isJieSuaning)
            return
        if(this.limitTime != undefined && this.limitTime > 0){
            this.limitTime--;
            this.lbLimitTime.string = this.limitTime.toString();
            if(this.limitTime == 0){
                if(this.gqCfgData.gTargetType != 2){
                    this.emitEvent("event_game_jiesuan",{isSucc:false});
                }
                else{

                }
            }
        }
    }

    //刷新游戏
    public refreshGame(){
        this.isGameInit = false;
        this.isJieSuaning = false;
        this.spBg.position = cc.v2(0,0);
        this.gameLeiJiTime = 0;
        this.limitTime = -1;
        this.limitBullet = -1;
        this.limitMiss = -1;
        this.monsterRound = 0; 
        this.targetsMgr.refresh();
        this.shootCtrl.refresh();
        this._mapLoadFinish();
        for(let k in this.uMonsterCfgData){
            let monsterData = this.uMonsterCfgData[k];
            monsterData.updateDelta = undefined
        }
        if(this.fortNode){
            this.fortNode.removeFromParent();
        }
    }

    //初始化游戏
    private _initGame(){
        this.UINode.active = true;
        for(let i = 1; i < 4; i++){
            cc.find("lbLimit" + i,this.UINode).active = false
        }
        //显示限制条件
        let limitIdx = 1;
        //限时
        if(this.gqCfgData.limitTime != -1){
            let path = "lbLimit" + limitIdx
            let nameNode = cc.find("lbLimit" + limitIdx,this.UINode)
            let lbName = nameNode.getComponent(cc.Label);
            nameNode.active = true;
            lbName.string = cc.vv.i18n.t("game_time")
            this.lbLimitTime = cc.find(path + "/lbLimitValue",this.UINode).getComponent(cc.Label);
            this.limitTime = this.gqCfgData.limitTime;
            this.lbLimitTime.string = this.limitTime.toString();
            limitIdx++;
        }
        //限制子弹
        if(this.gqCfgData.limitBullet != -1){
            let path = "lbLimit" + limitIdx
            let nameNode = cc.find("lbLimit" + limitIdx,this.UINode)
            let lbName = nameNode.getComponent(cc.Label);
            nameNode.active = true;
            lbName.string = cc.vv.i18n.t("bullet_count")
            this.lbLimitBullet = cc.find(path + "/lbLimitValue",this.UINode).getComponent(cc.Label);
            this.limitBullet = this.gqCfgData.limitBullet;
            this.lbLimitBullet.string = this.limitBullet.toString();
            limitIdx++;
        }
        //失误限制
        if(this.gqCfgData.limitMissCount != -1){
            let path = "lbLimit" + limitIdx
            let nameNode = cc.find("lbLimit" + limitIdx,this.UINode)
            let lbName = nameNode.getComponent(cc.Label);
            nameNode.active = true;
            lbName.string = cc.vv.i18n.t("miss_count")
            this.lbLimitMiss = cc.find(path + "/lbLimitValue",this.UINode).getComponent(cc.Label);
            this.limitMiss = this.gqCfgData.limitMissCount;
            limitIdx++;
        }
        //开启一个一秒执行一次的定时器，用作倒计时
        this.schedule(this._updateTimer,1);
        this.isGameInit = true;
        this.shootCtrl.setCanShoot(true);
        //如果是要塞模式，生成一个要塞
        if(this.gqCfgData.gTargetType == 4){
            this.fortNode = this.mapMgr.generateFort(this.taskParam[0])
        }
    }

    //显示关卡任务介绍
    private _showTaskIntroduce(){
        this.introduceNode.active = true;
        this.introduceNode.opacity = 255;
        this.UINode.active = false;
        let lbContent = cc.find("lbIntroduce",this.introduceNode).getComponent(cc.Label);
        let nLimitTime = cc.find("lbLimitTime",this.introduceNode);
        let nBullet = cc.find("lbBullet",this.introduceNode);
        let content = "";
        if(this.gqCfgData.gTargetType == 1){
            let targetId = this.taskParam[0]
            let MonsterData = DataMgr.getInstance().getMonsterCfgDataById(targetId);
            let name = cc.vv.i18n.t("target" + MonsterData.monsterType);
            content = cc.vv.i18n.t("game_task_info_content1")
            content = Common.getInstance().stringFormat(content,name,this.taskParam[1]);
            lbContent.string = content;
            content = cc.vv.i18n.t("limit_time")
            if(this.gqCfgData.limitTime > 0 ){
                content = Common.getInstance().stringFormat(content,this.gqCfgData.limitTime + cc.vv.i18n.t("second"));
            }
            else{
                content = Common.getInstance().stringFormat(content,'不限');
            }
            nLimitTime.getComponent(cc.Label).string = content;
            content = cc.vv.i18n.t("limit_bullet")
            if(this.gqCfgData.limitBullet > 0 ){
                content = Common.getInstance().stringFormat(content,this.gqCfgData.limitBullet + cc.vv.i18n.t("count"));
            }
            else{
                content = Common.getInstance().stringFormat(content,'不限');
            }
            nBullet.getComponent(cc.Label).string = content;
            nLimitTime.active = true;
            nBullet.active = true;
        }
        else if(this.gqCfgData.gTargetType == 2){
            content = cc.vv.i18n.t("game_Task_info_content2")
            content = Common.getInstance().stringFormat(content,this.taskParam[0]);
            lbContent.string = content;
            nLimitTime.active = false;
            nBullet.active = false;
        }
        else if(this.gqCfgData.gTargetType == 3){
            content = cc.vv.i18n.t("game_Task_info_content3")
            content = Common.getInstance().stringFormat(content,this.taskParam[0]);
            lbContent.string = content;
            nLimitTime.active = false;
            nBullet.active = false;
        }
        else if(this.gqCfgData.gTargetType == 4){
            content = cc.vv.i18n.t("game_Task_info_content4")
            content = Common.getInstance().stringFormat(content,this.cfgFortData.roundCount);
            lbContent.string = content;
            nLimitTime.active = false;
            nBullet.active = false;
        }

        let ac1 = cc.fadeOut(5);
        let ac2 = cc.callFunc(function(){
            this._initGame();
        }, this, "");
        let ac3 = cc.sequence(ac1,ac2);
        this.introduceNode.runAction(ac3)
    }

    //判断是否达到胜利条件
    //p1:是否发送结算
    private _isWin(_isEmit:boolean = true) : boolean{
        if(cc.vv.sceneParam.gameMode == "test")
            return;
        if(_isEmit == undefined)
            _isEmit = true;
        let ret = false;
        if(this.gqCfgData.gTargetType == 1){        //射击指定数量目标
            let id = parseInt(this.taskParam[0]);
            let count = this.taskParam[1]
            let beKilledCount = this.targetsMgr.getBeKillCountById(id);
            if(beKilledCount >= count){
                ret = true;
            }
        }
        else if(this.gqCfgData.gTargetType == 2){   //坚持X秒
            if(this.limitTime <= 0){
                ret = true;
            }
        }
        else if(this.gqCfgData.gTargetType == 3){   //  完美射击
            if(this.shootCtrl.perfectShootCount >= this.taskParam[0] ){
                ret = true;
            }
        }
        else if(this.gqCfgData.gTargetType == 4){   // 守护要塞
            let fortHp = this.fortNode.getComponent("FortController").hp
            if(this.monsterRound == this.cfgFortData.roundCount && fortHp > 0){
                ret = true;
            }
        }
        if(ret && _isEmit)
            this.emitEvent("event_game_jiesuan",{isSucc:true});
        return ret
    }

    //判断是否触发失败条件
    private _isLose(){

    }

    //根据配置设置目标移动信息
    private _setTargetMovePosData(_tarCtrl:any,_monsterData:any){
        let arr = [];
        let movePosData = DataMgr.getInstance().getMovPosCfgDataById(_monsterData.movePosID);
        let startPos = movePosData.movegenPos.split(',');
        let startPosV2 = cc.v2(parseInt(startPos[0]),parseInt(startPos[1]));
        _tarCtrl.node.position = startPosV2;
        arr.push(_tarCtrl.node.position);
        let movemidPos:string = movePosData.movemidPos;
        if(movemidPos != "-1"){
            let arrMovemidPos = movemidPos.split(';');
            for(let i in arrMovemidPos){
                let v = arrMovemidPos[i];
                let pos = String(v).split(',');
                let posV2 = cc.v2(parseInt(pos[0]),parseInt(pos[1]));
                arr.push(posV2);
            }
        }
        
        let endPos = movePosData.movEndPos.split(',');
        let endPosV2 = cc.v2(parseInt(endPos[0]),parseInt(endPos[1]));
        arr.push(endPosV2);
        _tarCtrl.setMoveArray(arr);
    }

    private _generateMonster(_monsterData:any,_radius:number){
        if(_monsterData.monsterType == Common.TargetType.ShortTerm){
            this.mapMgr.generateTermTargetsNearShootPos(_monsterData.monsterId,_radius,1,Common.TargetType.ShortTerm,_monsterData.timer);
        }
        else if(_monsterData.monsterType == Common.TargetType.LongTerm){
            this.mapMgr.generateTermTargetsNearShootPos(_monsterData.monsterId,_radius,1,Common.TargetType.LongTerm);
        }
        else if(_monsterData.monsterType == Common.TargetType.RandomMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.RandomMove,_radius,_monsterData.speed,150);
            tarCtrl.setId(_monsterData.monsterId);
        }
        else if(_monsterData.monsterType == Common.TargetType.HideRandomMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.HideRandomMove,_radius,_monsterData.speed,150);
            tarCtrl.setShowAndHideTime(_monsterData.showDelta,_monsterData.hideDelta);
            tarCtrl.setId(_monsterData.monsterId);
        }
        else if(_monsterData.monsterType == Common.TargetType.IntRandomMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.IntRandomMove,_radius,_monsterData.speed,150);
            tarCtrl.setMoveAndStopTime(_monsterData.stopInterval,_monsterData.stopDelta);
            tarCtrl.setId(_monsterData.monsterId);
        }
        else if(_monsterData.monsterType == Common.TargetType.Move){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.Move,_radius,_monsterData.speed,150);
            this._setTargetMovePosData(tarCtrl,_monsterData)
            tarCtrl.setId(_monsterData.monsterId);
        }
        else if(_monsterData.monsterType == Common.TargetType.HideMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.HideMove,_radius,_monsterData.speed,150);
            this._setTargetMovePosData(tarCtrl,_monsterData)
            tarCtrl.setShowAndHideTime(_monsterData.showDelta,_monsterData.hideDelta);
            tarCtrl.setId(_monsterData.monsterId);
        }
        else if(_monsterData.monsterType == Common.TargetType.SplitMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.SplitMove,_radius,_monsterData.speed,150);
            tarCtrl.setId(_monsterData.monsterId);
        }
        else if(_monsterData.monsterType == Common.TargetType.People){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.People,_radius,_monsterData.speed,150);
            tarCtrl.setId(_monsterData.monsterId);
        }
        else if(_monsterData.monsterType == Common.TargetType.SpyMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.SpyMove,_radius,_monsterData.speed,150);
            tarCtrl.setSpyAndManTime(_monsterData.manShowInterval,_monsterData.manShowDelta);
            tarCtrl.setId(_monsterData.monsterId);
        }
        else if(_monsterData.monsterType == Common.TargetType.AttFort){
            this.mapMgr.generateAttFortTargetNearFort(_monsterData.monsterId,_radius,_monsterData.speed,this.fortNode.position,_monsterData.movePosID,_monsterData.genPos);
        }
    }

    //初始化关卡数据,优先于INITGame调用
    private _initTaskData(){
        this.guanQiaId = cc.vv.sceneParam.id;
        /** this.gqCfgData 数据结构
         *  {
            "gId": 1011,
            "gTargetType": 1,   1为射击指定数量的目标(ID,数量) 2为坚持X秒(秒) 3为完成X次完美射击(数量) 4为守护要塞(堡垒id)
            "typeParam": "10001,10",
            "limitTime": 120,   限时
            "limitBullet": -1,  子弹限制
            "limitTarget": -1,  限制目标(平民ID)
            "limitMissCount": -1,   失误次数上限
            "limitDisappear": -1,   限制消失（怪物id,怪物id）
            "uMonsterId": 101,  怪物集id
            "uManId": -1,       平民集id
            "uSupplyId": -1,    补给集id
            "goldAward": 50     获得奖励
            },
         */
        this.gqCfgData = DataMgr.getInstance().getGuanQiaCfgDataById(this.guanQiaId);
        this.taskParam = this.gqCfgData.typeParam.toString().split(',');   //不同任务类型有不同的参数
        /**
         * {
            "uMonsterId": 101,
            "monsterId": 10001,
            "img": "",
            "monsterType": 1,
            "initGenTime": 0,
            "isCoexist": 1,
            "refreshInteval": 3,
            "isRefreshDied": 0,
            "isGenOnStart": 0,
            "genPos": 0,
            "movEndPos": -1,
            "timer": -1,
            "initHideTime": -1,
            "hideDelta": -1,
            "showDelta": -1,
            "initStop": -1,
            "stopInterval": -1,
            "stopDelta": -1,
            "speed": -1,
            "isSplit": 0,
            "childId": -1,
            "initManTime": -1,
            "manShowDelta": -1,
            "manShowInterval": -1,
            "manShowCount": -1,
            "monsterHp": 1
        },
         */
        if(this.gqCfgData.gTargetType == 4){
            //守护要塞模式
            this.monsterRound = 0;//怪物波数
            this.cfgFortData = DataMgr.getInstance().getFortCfgDataById(this.taskParam[0]);
            this.cfgFortData.uMonsterId = this.cfgFortData.uMonsterId.toString().split(',');    //字符串转换成数组
            this.uMonsterCfgData = DataMgr.getInstance().getMonsterCfgDataByUid(this.cfgFortData.uMonsterId[this.monsterRound]); //怪物集配置数据
        } 
        else{
            this.uMonsterCfgData = DataMgr.getInstance().getMonsterCfgDataByUid(this.gqCfgData.uMonsterId); //怪物集配置数据
        }
        this.uMenCfgData = DataMgr.getInstance().getMenCfgDataByUid(this.gqCfgData.uManId); //平民集配置数据
        this.uSupplyCfgData = DataMgr.getInstance().getSupplyCfgDataByUid(this.gqCfgData.uSupplyId);    //补给集配置数据
    }

    //操作测试
    private _testGame() {
        //生成10个长期驻守目标
        this.mapMgr.generateTermTargetsNearShootPos(10001,50,10,Common.TargetType.LongTerm,-1,0);
    }

    //------------------------------------------------------------监听事件Begin-------------------------------

    //地图管理控件加载完毕
    private _mapLoadFinish(){
        if(cc.vv.sceneParam.gameMode == "test"){
            //为操控的游戏测试模式
            this.btNode.active = false;
            this.btBack.active = true;
            this._testGame();
        }
        else if(cc.vv.sceneParam.gameMode == "guanka"){
            //this.btNode.active = true;
            this.btBack.active = false;
            this._initTaskData();
            this._showTaskIntroduce();
        }
    }

    //所有目标被清空
    private _allTargetClear(){
        if(cc.vv.sceneParam.gameMode == "test" && this.testBackClick == false){
            this._testGame();
        }
        else{
            //非测试状态，游戏中，适用于堡垒模式，控制波数
            if(this.gqCfgData.gTargetType == 4){
                this.monsterRound++;
                if(this.monsterRound < this.cfgFortData.roundCount){
                    //延迟修改，凸显下一波
                    this.scheduleOnce(function() {
                        this.uMonsterCfgData = DataMgr.getInstance().getMonsterCfgDataByUid(this.cfgFortData.uMonsterId[this.monsterRound])
                    }.bind(this), 2);
                }
                else{
                    this._isWin(true);
                }
            }
        }
    }

    //设置命中率,子弹数量
    private _setHitRate(){
        if(cc.vv.sceneParam.gameMode == "test")
            return;
        this.lbHitRate.string = this.shootCtrl.getHitRate() + "%"
        //是否限制子弹,是则修改子弹数量
        if(this.gqCfgData.limitBullet > 0){
            let leftBullet = this.limitBullet - this.shootCtrl.shootCount;
            leftBullet = leftBullet < 0 ? 0 : leftBullet;
            this.lbLimitBullet.string = leftBullet.toString();
            if(leftBullet <= 0){
                this.shootCtrl.setCanShoot(false);
                if(leftBullet <= 0 && !this._isWin(false)){
                    //是否限制子弹，是否在成功前就已经没有子弹了
                    this.emitEvent("event_game_jiesuan",{isSucc:false});
                }
            }
        }
    }

    private _on_game_jiesuan(event : any) {
        let param = event;
        this.isJieSuaning = true
        let jieSuanUI = this.jieSuanNode.getComponent('JieSuan');
        jieSuanUI.showJieSuan(param.isSucc,this.guanQiaId);
        this.UINode.active = false;
        this.targetsMgr.removeAllTargets();
        if(param.isSucc)
            cc.vv.dataMgr.saveGuanQiaById(this.guanQiaId)
    }

    //击杀一个目标后通知
    private _killTarget(event : any){
        let param = event;
        this.shootCtrl.killTarget();
        if(!this._isWin()){
            for(let k in this.uMonsterCfgData){
                let v = this.uMonsterCfgData[k];
                if(v.monsterId == event.monsterId){
                    if(v.isRefreshDied){
                        v.updateDelta = undefined;//设置为undefiend后，updateMonster中就会调用生成，相当于立即刷新
                    }
                }
            }
        }
    }

    //刷新游戏
    private _gameRefresh(event:any){
        this.refreshGame();
    }

     //------------------------------------------------------------监听事件End------------------------------------



    //---------------------------------------------------点击事件回调begin-----------------------------------------

    public onRestartClick(event:any, customEventData:any){
        //this.jieSuanNode.active = false;
        //this.UINode.active = true;
        this.spBg.position = cc.v2(0,0)        
        cc.director.loadScene("loginScene");
    }

    public onBackClick(event:any, customEventData:any){
        this.testBackClick = true;
        this.targetsMgr.removeAllTargets();
        cc.vv.sceneParam.showLayer = "opSetting";
        cc.director.loadScene("loginScene");
    }
    //--------------------------------------------------点击事件回调End----------------------------------------------
}
