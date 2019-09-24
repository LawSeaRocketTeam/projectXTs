
cc.Class({
    extends: cc.Component,

    properties: {
        sensi : 5,  //灵敏度
        op : 0 ,    //0左手准星 1右手准星
        txtOp :cc.Label,
        txtSensi :cc.Label,
        sensiSlider : cc.Slider,
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        //i18n.init( cc.sys.language) //注意运行时必须保证 i18n.init(language) 在包含有 LocalizedLabel 组件的场景加载前执行
     },

    start () {
        this._setSensi(cc.vv.dataMgr.opSetting.sensi);
        this._setOp(cc.vv.dataMgr.opSetting.op);
        this.sensiSlider.progress = this.sensi / 10;
        this.sensiSlider.node.on("slide",this.sliderCallBack,this);
    },

    _setOp : function(_op){
        this.op = _op;
        if(this.op == 0){
            this.txtOp.string = cc.vv.i18n.t("left_hand")
        }
        else{
            this.txtOp.string = cc.vv.i18n.t("right_hand")
        }
    },

    _setSensi : function(_sensi){
        this.sensi = _sensi
        this.txtSensi.string = _sensi;
    },

    _save(){
      if(this.op == cc.vv.dataMgr.opSetting.op && this.sensi == cc.vv.dataMgr.opSetting.sensi){
          //数值没变，直接return
          return
      }  
      else{
          cc.vv.dataMgr.saveOpSetting(this.op,this.sensi);
      }
    },

    sliderCallBack : function(slider){
        let progress = Math.ceil(slider.progress * 10);
        if(progress < 1){
            progress = 1;
        }
        this._setSensi(progress)
    },

    onCloseClick:function(event, customEventData){
        this._save();
        this.node.active = false;
    },

    onChangeClick : function(event, customEventData){
        this._setOp(!this.op);
    },

    onTestClick : function(event,customEventData){
        cc.vv.sceneParam.gameMode = "test";
        this._save();
        cc.director.loadScene("gameScene");
    }

    // update (dt) {},
});
