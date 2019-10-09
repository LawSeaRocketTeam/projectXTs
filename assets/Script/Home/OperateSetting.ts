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
export default class OperateSetting extends BaseComponent {

    @property(cc.Label)
    txtOp: cc.Label = null;

    @property(cc.Label)
    txtSensi: cc.Label = null;

    @property(cc.Slider)
    sensiSlider: cc.Slider = null;

    @property
    sensi: number = 5;

    @property
    op: number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this._setSensi(DataMgr.getInstance().opSetting.sensi);
        this._setOp(DataMgr.getInstance().opSetting.op);
        this.sensiSlider.progress = this.sensi / 10;
        this.sensiSlider.node.on("slide",this.sliderCallBack,this);
    }
    
    private _setOp(_op:number) : void{
        this.op = _op;
        if(this.op == 0){
            this.txtOp.string = cc.vv.i18n.t("left_hand")
        }
        else{
            this.txtOp.string = cc.vv.i18n.t("right_hand")
        }
    }

    private _setSensi(_sensi:number) : void{
        this.sensi = _sensi
        this.txtSensi.string = _sensi.toString();
    }

    private _save() : void{
        if(this.op == DataMgr.getInstance().opSetting.op && this.sensi == DataMgr.getInstance().opSetting.sensi){
            //数值没变，直接return
            return
        }  
        else{
            DataMgr.getInstance().saveOpSetting(this.op,this.sensi);
        }
    }

    public sliderCallBack(slider : cc.Slider) : void {
        let progress = Math.ceil(slider.progress * 10);
        if(progress < 1){
            progress = 1;
        }
        this._setSensi(progress)
    }

    public onCloseClick(_event,_customEventData){
        this._save();
        this.node.active = false;
    }

    public onChangeClick(_event, _customEventData){
        if(this.op == 0)
            this.op = 1;
        else
            this.op = 0;
        this._setOp(this.op);
    }

    public onTestClick(event,customEventData){
        cc.vv.sceneParam.gameMode = "test";
        this._save();
        cc.director.loadScene("gameScene");
    }

    // update (dt) {}
}
