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

import Singleton from '../Base/Singleton';
import MsgBoxController from '../Common/MsgBoxController'

@ccclass
export default class MsgBox extends Singleton {

    public show(_parent:cc.Node,_content:string,_title:string = undefined,_leftBtTxt:string = undefined,_leftFunc:any = undefined,_rightBtTxt:string = undefined,_rightFunc:any = undefined){
        let onResourceLoaded = function(errorMessage, loadedResource )
        {
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~onResourceLoaded");
            if( errorMessage ) { cc.log('Prefab error:' + errorMessage ); return; }
            if( !( loadedResource instanceof cc.Prefab ) ) { cc.log('Prefab error'); return; } 
            var newMyPrefab = cc.instantiate( loadedResource );
            _parent.addChild(newMyPrefab);
            newMyPrefab.position = cc.v2(0, 0);
            
            var newMyPrefabScript:MsgBoxController = newMyPrefab.getComponent("MsgBoxController");
            newMyPrefabScript.show(_content,_title,_leftBtTxt,_leftFunc,_rightBtTxt,_rightFunc);
        };
        cc.loader.loadRes('Prefab/msgbox', onResourceLoaded );
    }
}
