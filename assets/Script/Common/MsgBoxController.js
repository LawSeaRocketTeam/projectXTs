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
        floatNode : cc.Node,
        boxNode : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
    },

    show : function(_content,_title,_leftBtTxt,_leftFunc,_rightBtTxt,_rightFunc){
        if(_leftBtTxt == undefined && _rightBtTxt == undefined){
            //如果左右按钮皆为空，默认用飘窗
            this.floatNode.active = true;
            this.boxNode.active = false;
            let lbTxt = this.floatNode.getChildByName("lbTxt").getComponent(cc.Label);
            lbTxt.string = _content;
            let ac1 = cc.moveTo(3,cc.v2(this.floatNode.x - 0,this.floatNode.y + 400));
            let ac2 = cc.fadeOut(3);
            let ac3 = cc.spawn(ac1,ac2);
            let ac4 = cc.callFunc(function () {
                this.node.removeFromParent();
            }, this, "");
            let ac5 = cc.sequence(ac3,ac4);
            this.floatNode.runAction(ac5);
        }
        else{
            this.floatNode.active = false;
            this.boxNode.active = true;
            let lbContent = cc.find("set2_btn_empty/set_board_sensivity/lbContent",this.boxNode).getComponent(cc.Label);
            lbContent.string = _content;
            let lbTitle = cc.find("set2_btn_empty/lbTitle",this.boxNode).getComponent(cc.Label);
            lbTitle.string = _title;
            let btSure1 = cc.find("set2_btn_empty/btSure1",this.boxNode);
            let btSure2 = cc.find("set2_btn_empty/btSure2",this.boxNode);
            let btCancel = cc.find("set2_btn_empty/btCancel",this.boxNode);
            this.leftFunc = _leftFunc;
            this.rightFunc = _rightFunc;
            if(_rightBtTxt == undefined){
                btSure1.active = true;
                btSure2.active = false;
                btCancel.active = false;
                btSure1.getChildByName("txt").getComponent(cc.Label).string = _leftBtTxt;
            }
            else{
                btSure1.active = false;
                btSure2.active = true;
                btCancel.active = true;
                btSure2.getChildByName("txt").getComponent(cc.Label).string = _leftBtTxt;
                btCancel.getChildByName("txt").getComponent(cc.Label).string = _rightBtTxt;
            }
        }
    },

    onLeftClick : function(event, customEventData){
        if(this.leftFunc != undefined){
            this.leftFunc(event, customEventData);
        }
        this.node.removeFromParent();
        this.leftFunc = undefined;
    },

    onRightClick : function(event, customEventData){
        if(this.rightFunc != undefined){
            this.rightFunc(event, customEventData);
        }
        this.node.removeFromParent();
        this.rightFunc = undefined;
    },

    // update (dt) {},
});
