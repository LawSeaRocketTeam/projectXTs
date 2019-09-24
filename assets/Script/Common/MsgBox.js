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
        
    },

    ctor : function() {

    },

    show : function(_parent,_content,_title,_leftBtTxt,_leftFunc,_rightBtTxt,_rightFunc){
        let onResourceLoaded = function(errorMessage, loadedResource )
        {
           
            if( errorMessage ) { cc.log('Prefab error:' + errorMessage ); return; }
            if( !( loadedResource instanceof cc.Prefab ) ) { cc.log('Prefab error'); return; } 
            var newMyPrefab = cc.instantiate( loadedResource );
            _parent.addChild(newMyPrefab);
            newMyPrefab.position = cc.v2(0, 0);
            var newMyPrefabScript = newMyPrefab.getComponent('MsgBoxController');
            newMyPrefabScript.show(_content,_title,_leftBtTxt,_leftFunc,_rightBtTxt,_rightFunc);
        };
        cc.loader.loadRes('Prefab/msgbox', onResourceLoaded );
    }
});
