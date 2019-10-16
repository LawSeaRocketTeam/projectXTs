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

import EventDispatcher from './EventDispatcherMgr';

@ccclass
export default class BaseComponent extends cc.Component {

    public vEvents:string[] = [];
    onLoad () {
        this.vEvents = [];
    }

    //start () {

    //}

    // update (dt) {}
    onEnable(){
        //console.log("~~~~~~~~~~BaseComponent onEnable");
    }

    onDisable(){
        
    }

    onDestroy(){
        //清除事件注册
        for(let e of this.vEvents){
            EventDispatcher.getInstance().distatch(this.node,e);
        }
        this.vEvents = [];
    }

    public emitEvent(_event:string,_param:any = null){
        EventDispatcher.getInstance().emit(_event,_param);
    }

    public onEvent(_event:string,_func:any,_self:any){
        EventDispatcher.getInstance().on(this.node,_event,_func,_self);
        //记录注册事件
        this.pushEvent(_event);
    }

    public pushEvent(_event:string){
        for(let e of this.vEvents){
            if(e == _event){
                cc.log("BaseComponent regist the same Event " + _event);
                return;
            }
        }
        this.vEvents.push(_event);
    }
}
