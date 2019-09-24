var Common = require("../Common/Common");
//标靶目标管理脚本
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        
    },

    ctor: function () {
        this.SHOW_STATUS = {
            HIDE:0,
            SHOW:1,
        };
        this.MOVE_STATUS = {
            STOP:0,
            MOVE:1,
        };
        this.SPY_STATUS = {
            MON:0,
            MAN:1,
        };
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var canvas = cc.find("Canvas")
        this.targetsMgr = canvas.getComponent("TargetsMgr");
        this.mapMgr = canvas.getComponent("MapMgr");
    },

    // start () {

    // },
    //Func：刷新数据
    //_tarType:目标类型
    //_position:位置
    //_activeTime:存活时间
    //_speed:移动速度
    //_direction:移动方向角度
    refresh: function(_tarType,_position,_radius,_activeTime,_speed,_direction)
    {
        let date = new Date();
        //参数默认值
        _radius = _radius || 50;
        _activeTime = _activeTime|| -1; 
        _speed = _speed || -1; 
        _direction = _direction || 0;
        this.tarType = _tarType;
        this.radius = _radius;
        this.node.setPosition(_position);
        this.node.active = true;
        this.node.opacity = 255;
        this.activeTime = _activeTime;
        this.initTime = date.getTime()    //生成时间
        this.speed = _speed;   //每秒移动速度，游戏限制30帧
        this.dirDegress = _direction;
        this.dirVec = Common.degreesToVectors(_direction);
        this.dirChange = false;
        this.leijiTime = 0; //累计存活时间
        this.hasUpdateFillRange = false;    //是否已经进入圆倒计时
        this.fillRangeSpeed = 0;    //圆倒计时速度
        this.targetMon = this.node.getChildByName("spMonster");
        this.targetTime = this.node.getChildByName("spTargetTime");
        this.targetMan = this.node.getChildByName("spMan");
        this.targetTime.active  = false;
        this.targetMan.active = false
        this.targetMon.active = true;
        this.showLastTime = 0;  //现身持续时间（适用于隐身目标）
        this.hideLastTime = 0; //隐身持续时间（适用于隐身目标）
        this.moveLastTime = 0;  //移动持续时间（适用于间歇移动目标）
        this.stopLastTime = 0;  //移动持续时间（适用于间歇移动目标）
        this.spyLastTime = 0;   //间谍移动持续时间(适用于间谍目标)
        this.manLastTime = 0;   //平民移动持续时间(适用于平民目标)
        this.moveArr = [];      //移动点数组（适用于轨迹移动目标）
        this.moveArrIdx = 0;    //当前执行下标
        this.showStatus = this.SHOW_STATUS.SHOW;
        this.moveStatus = this.MOVE_STATUS.MOVE;
        this.spyStatus = this.SPY_STATUS.MON;   //间谍类怪当前状态
        let circleCollider = this.getComponent(cc.CircleCollider);
        if(_radius != undefined){
            this.node.scale = _radius / circleCollider.radius;
        }
        if(this.tarType == Common.TargetType.ShortTerm)
        {
            this.targetTime.active  = true
            this.spTarTime = this.targetTime.getComponent(cc.Sprite);
            if(this.spTarTime == null){
                console.log("this.spTarTime = null");
            }
            this.spTarTime.fillRange = 1;
        }
        if(this.tarType == Common.TargetType.People){
            this.targetMan.active = true;
            this.targetMon.active = false;
        }
    },

    //设置目标ID
    setId : function(_id){
        this.id = _id;
    },

    //设置自己在地图上的哪个块区,适用于驻留目标
    setBlock : function(_block){
        this.block = _block;
        _block.targets.push(this.node);
    },

    //设置隐身和现身时长
    setShowAndHideTime(_showTime,_hideTime){
        this.showLastTime = _showTime;
        this.hideLastTime = _hideTime;
    },

    //设置隐身和现身时长
    setMoveAndStopTime(_moveTime,_stopTime){
        this.moveLastTime = _moveTime;
        this.stopLastTime = _stopTime;
    },

    //设置间谍和平民时长
    setSpyAndManTime(_spyTime,_manTime){
        this.spyLastTime = _spyTime;
        this.manLastTime = _manTime;
    },

    //设置移动轨迹数组
    setMoveArray(_arr){
        this.moveArr = _arr;
    },

    //从地图的block块中移除
    removeFromBlock : function(){
        if(this.block == undefined){
            return;
        }
        for(let i = 0; i < this.block.targets.length; i++){
            if(this.block.targets[i] == this.node){
                this.block.targets.splice(i,1);
                break;
            }
        }
        this.block = undefined;
    },

    //进入碰撞后触发
    onCollisionEnter: function (other, self) {

        if(other.node.name == "spFort"){    //堡垒碰撞
            this.targetsMgr.addIdleTarget(this.node);    
        }   
        //tag值是为了避免其他目标之间互相碰撞     
        if(!this.dirChange && other.tag == 2){
            //console.log('on collision onCollisionEnter = ' + self.node.name);
            //console.log('on collision enter dirVec = ' + this.dirVec);
            //console.log('on collision enter node name = ' + other.node.name);
            //根据不同的碰撞壁和移动方向进行镜面反射计算
            if(other.node.name == "up_collider"){
                if(this.dirVec.x > 0){
                    this.dirDegress += 90;
                }
                else if(this.dirVec.x < 0){
                    this.dirDegress -= 90;
                }
                else{
                    this.dirDegress += 180;
                }
            }
            else if(other.node.name == "right_collider"){
                if(this.dirVec.y > 0){
                    this.dirDegress -= 90;
                }
                else if(this.dirVec.y < 0){
                    this.dirDegress += 90;
                }
                else{
                    this.dirDegress += 180;
                }
            }
            else if(other.node.name == "down_collider"){
                if(this.dirVec.x > 0){
                    this.dirDegress -= 90;
                }
                else if(this.dirVec.x < 0){
                    this.dirDegress += 90;
                }
                else{
                    this.dirDegress += 180;
                }
            }
            else if(other.node.name == "left_collider"){
                if(this.dirVec.y > 0){
                    this.dirDegress += 90;
                }
                else if(this.dirVec.y < 0){
                    this.dirDegress -= 90;
                }
                else{
                    this.dirDegress += 180;
                }
            }
            this.dirDegress = this.dirDegress < 360 ? this.dirDegress : this.dirDegress - 360;
            this.dirVec = Common.degreesToVectors(this.dirDegress);
            this.dirChange = true;
            //console.log('on collision enter dirDegress = ' + this.dirDegress);   
        }     
    },

    onCollisionStay: function (other, self) {
    },

    onCollisionExit: function (other, self) {
        if(other.tag == 2)
        {
            //console.log('on collision onCollisionExit = ' + self.node.name);
            this.dirChange = false;
        }
    },

    update (dt) {
        this.leijiTime += dt;
        //短期驻守怪执行倒计时
        if(this.tarType == Common.TargetType.ShortTerm){
            //当存活时间少于一半时，开始进行倒计时
            if(this.leijiTime > this.activeTime / 2){
                this._updateFillRange(dt);
            }
        }
        //移动类型目标处理
        if(this.tarType == Common.TargetType.RandomMove || this.tarType== Common.TargetType.HideRandomMove ||
            this.tarType == Common.TargetType.SplitMove || this.tarType == Common.TargetType.People ||
            this.tarType == Common.TargetType.SpyMove || this.tarType == Common.TargetType.AttFort){
            this.node.x += this.speed * this.dirVec.x * dt;
            this.node.y += this.speed * this.dirVec.y * dt;
            //console.log('update pos = ' + this.node.position + "tag = " + this.node.name);
        }
        //轨迹移动目标处理
        if(this.tarType == Common.TargetType.Move || this.tarType == Common.TargetType.HideMove){
            //不能用相等，应为会有可能产生小数，这能用距离容差
            let dipDis = this.node.position.sub(this.moveArr[this.moveArrIdx]).mag();
            if(dipDis <= 2){
                this.moveArrIdx++;
                this.moveArrIdx = this.moveArrIdx < this.moveArr.length ? this.moveArrIdx : 0
                let dst = this.moveArr[this.moveArrIdx]
                let distance = this.node.position.sub(dst).mag();
                let time = distance / this.speed;
                this.node.runAction(cc.moveTo(time,dst))
            }
        }
        //间歇移动类型目标
        if(this.tarType == Common.TargetType.IntRandomMove){
            if(this.moveStatus == this.MOVE_STATUS.MOVE){
                this.node.x += this.speed * this.dirVec.x * dt;
                this.node.y += this.speed * this.dirVec.y * dt;
                if(this.leijiTime > this.moveLastTime){
                    this.moveStatus = this.MOVE_STATUS.STOP;
                    this.leijiTime = 0;
                }
            }
            if(this.moveStatus == this.MOVE_STATUS.STOP){
                if(this.leijiTime > this.stopLastTime){
                    this.moveStatus = this.MOVE_STATUS.MOVE;
                    this.dirDegress = Common.seededRandom(0,360,true);//重新随机一个方向
                    this.dirVec = Common.degreesToVectors(this.dirDegress);
                    this.leijiTime = 0;
                }
            }
            //console.log('update pos = ' + this.node.position + "tag = " + this.node.name);
        }
        //隐身类目标处理
        if(this.tarType == Common.TargetType.HideRandomMove || this.tarType == Common.TargetType.HideMove){
            if(this.showStatus == this.SHOW_STATUS.SHOW){
                if(this.leijiTime > this.showLastTime)
                {
                    this.node.runAction(cc.fadeOut(0.5));
                    this.leijiTime = 0;
                    this.showStatus = this.SHOW_STATUS.HIDE;
                }
                    
            }
            if(this.showStatus == this.SHOW_STATUS.HIDE){
                if(this.leijiTime > this.hideLastTime)
                {
                    this.node.runAction(cc.fadeIn(0.5));
                    this.leijiTime = 0;
                    this.showStatus = this.SHOW_STATUS.SHOW;
                }
                    
            }
        }
        //间谍类目标处理
        if(this.tarType == Common.TargetType.SpyMove){
            if(this.spyStatus == this.SPY_STATUS.MON){
                if(this.leijiTime > this.spyLastTime)
                {
                    this.targetMon.active = false;
                    this.targetMan.active = true;
                    this.leijiTime = 0;
                    this.spyStatus = this.SPY_STATUS.MAN;
                }
                    
            }
            if(this.spyStatus == this.SPY_STATUS.MAN){
                if(this.leijiTime > this.manLastTime)
                {
                    this.targetMon.active = true;
                    this.targetMan.active = false;
                    this.leijiTime = 0;
                    this.spyStatus = this.SPY_STATUS.MON;
                }   
            }
        }
    },

    //spTargetTime的倒计时实现
    _updateFillRange:function(dt){
        if(!this.hasUpdateFillRange){      
            var leftTime = this.activeTime - this.leijiTime;
            this.fillRangeSpeed = 1 / leftTime;
            this.hasUpdateFillRange = true; 
            //console.log("fillRangeSpeed = " + this.fillRangeSpeed);
            //console.log("fillRange = " + this.spTarTime.fillRange);
        }
        else
        {
            //倒计时开始，倒计时完后移除节点
            var fillRange = this.spTarTime.fillRange;
            fillRange = fillRange > 0 ? fillRange -= (dt * this.fillRangeSpeed) : 0;
            this.spTarTime.fillRange = fillRange;
            if(fillRange == 0)
            {
                //this.node.removeFromParent();
                this.targetsMgr.addIdleTarget(this.node);
                //出发游戏结束
                cc.vv.gameNode.emit("event_game_jiesuan",{isSucc:false});
            }
        }
    },

    //检测点是否在目标中
    //这里模拟点是一个一传入点为圆心，半径为1的圆
    checkIsInPoint : function(_shootPoint){
        let circleCollider = this.getComponent(cc.CircleCollider);
        //两个圆是否相交，射击点用1个像素的圆
        let colliderRadius = circleCollider.radius * this.node.scale;
        let colliderPoint = cc.v2(this.node.position.x,this.node.position.y + circleCollider.offset.y * this.node.scale);
        if(cc.Intersection.circleCircle({position:_shootPoint,radius:1},{position:colliderPoint,radius:colliderRadius})){
            return true;
        }
        return false;
    },

    //检测是否完美射击，靶心10个像素范围内
    checkIsPerfect : function(_shootPoint){
        let circleCollider = this.getComponent(cc.CircleCollider);
        //两个圆是否相交，射击点用1个像素的圆
        let colliderRadius = 10;
        let colliderPoint = cc.v2(this.node.position.x,this.node.position.y + circleCollider.offset.y * this.node.scale);
        if(cc.Intersection.circleCircle({position:_shootPoint,radius:1},{position:colliderPoint,radius:colliderRadius})){
            return true;
        }
        return false;
    },

    //被射击中
    beShoot(){
        console.log("--------------be shoot----------------");
        if(this.tarType == Common.TargetType.SplitMove){
            //如果是分裂怪被击中，先消失，再生成两个随机怪
            this.mapMgr.generateTarget(Common.TargetType.RandomMove,this.radius/2,this.speed,this.node.position);
            this.mapMgr.generateTarget(Common.TargetType.RandomMove,this.radius/2,this.speed,this.node.position);
            this.targetsMgr.addIdleTarget(this.node);
        }
        else{
            //播放受击动画，消失
            this.targetsMgr.addBeKillId(this.id);   //这个不要放在动画结束后调用，因为外部需要及时知道当前是否已经被击杀
            var finished = cc.callFunc(function () {
                this.targetsMgr.addIdleTarget(this.node);
                cc.vv.gameNode.emit("game_kill_target",{monsterId:this.id});
            }, this, "");
            var myAction = cc.sequence(cc.blink(0.3,2),cc.fadeOut(0.5), finished);
            this.node.runAction(myAction);
            if(this.tarType == Common.TargetType.People || (this.tarType == Common.TargetType.SpyMove && this.spyStatus == this.SPY_STATUS.MAN))
            {
                //射中平民或者平民状态下的间谍怪，游戏结束
                setTimeout(function() {
                    cc.vv.gameNode.emit("event_game_jiesuan",{isSucc:false});
                }, 800);
            }
        }
        
    },
});
