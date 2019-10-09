
var Common = cc.Class({
    statics:{      
        TargetType : {
            LongTerm:1,        //短期固定怪 可触发游戏结束 
            ShortTerm:2,         //长期固定怪 
            Move:3,             //直线轨迹移动怪
            HideMove:4,         //隐身直线轨迹移动怪
            RandomMove:5,       //随机移动怪
            HideRandomMove:6,   //隐身随机移动怪
            IntRandomMove:7,    //间歇随机移动怪
            SplitMove:8,        //分裂移动怪
            SpyMove:9,          //间谍怪 可触发游戏结束
            People:10,          //平民 可触发游戏结束
            AttFort:11,         //攻击堡垒怪 (堡垒模式专用)
        },

        //四舍五入保留2位小数（若第二位小数为0，则保留一位小数）
        keepTwoDecimal : function(num) {
            var result = parseFloat(num);
            result = Math.round(num * 100) / 100;
            return result;
        },

        //真随机
        seededRandom : function(min, max,_isInt) {
            max = max || 1;
            min = min || 0;
            _isInt = _isInt || false;
            let seed = new Date().getTime();
            seed = (seed * 9301 + 49297) % 233280;
            let rnd = seed / 233280.0;
            let ret = this.keepTwoDecimal( min + rnd * (max - min) )
            if(_isInt){
                ret = Math.ceil(ret);
            }
            return ret;   // Math.ceil实现取整功能，可以根据需要取消取整
        },
        
        //伪随机
        randomFrom : function(_lowerValue,_upperValue){
            return Math.floor(Math.random() * (_upperValue - _lowerValue + 1) + _lowerValue);
        },
    
        //获取一个坐标点半径范围内的随机点
        randomFromPoint : function(_point,_radius){
            let x = this.randomFrom(_point.x - _radius,_point.x + _radius);
            let y = this.randomFrom(_point.y - _radius,_point.y + _radius);
            return cc.v2(x,y);
        },


        //已知向量求角度
        vectorsToDegress: function (dirVec) {
            let comVec = cc.v2(0, 1);    // 水平向右的对比向量
            let radian = dirVec.signAngle(comVec);    // 求方向向量与对比向量间的弧度
            let degree = cc.misc.radiansToDegrees(radian);    // 将弧度转换为角度
            return degree;
        },

        //已知角度求向量
        degreesToVectors: function (degree) {
            if(degree <= 0){
                degree += 360;
            }

            if(degree == 90){
                return cc.v2(1,0);
            }
            else if(degree == 180){
                return cc.v2(0,-1);
            }
            else if(degree == 270){
                return cc.v2(-1,0);
            }
            else if(degree == 360){
                return cc.v2(0,1);
            }
            let radian = cc.misc.degreesToRadians(degree);    // 将角度转换为弧度
            let comVec = cc.v2(0, 1);    // 一个水平向右的对比向量
            let dirVec = comVec.rotate(-radian);    // 将对比向量旋转给定的弧度返回一个新的向量
            return dirVec;
        },

        //字符串格式化
        stringFormat : function() {
            if( arguments.length == 0 )
                return null; 
            var str = arguments[0]; 
            for(var i=1;i<arguments.length;i++) {
                var re = new RegExp('\\{' + (i-1) + '\\}','gm');
                str = str.replace(re, arguments[i]);
            }
            return str;
        }, 
    }
});

module.exports = Common;