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

import BaseComponent from '../Base/BaseComponent';
import DataMgr from '../Base/DataMgr';
import MsgBox from '../Common/MsgBox';

@ccclass
export default class TestSetting extends BaseComponent {
    
    @property(cc.EditBox)
    editBox: cc.EditBox = null;
    
    start () {

    }

    // update (dt) {}

    public onTestClick(_event,_customEventData){
        //let id : number = parseInt(this.editBox.string);
       // DataMgr.getInstance().cmdGuanQiaSave(id);
       // MsgBox.getInstance().show(this.node,"设置成功");
       this.emitEvent("login_test");
    }

    public onCloseClick(_event,_customEventData){
        this.node.active = false;
    }
}
