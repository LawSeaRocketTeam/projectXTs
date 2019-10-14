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

import Singleton from './Singleton';

@ccclass
export default class EventDispatcherMgr extends Singleton{

    private arrEvents : any[] = [];

    constructor() {
        super();
    }

    public init(){
        this.arrEvents = [];
    }

    public on(_node:cc.Node,_event:string,_func:any,_self:any){
        let vEvent = this._findEvent(_event);
        _node.on(_event,_func,_self);
        if(vEvent == null){
            vEvent = {event:_event,nodes:[]};
            this.arrEvents.push(vEvent);
        }
        vEvent.nodes.push(_node) 
    }

    public emit(_event:string){
        let vEvent = this._findEvent(_event);
        if(vEvent == null){
            cc.log("EventDispatcherMgr can't find event");
            return;
        }
        for(let k in vEvent.nodes){
            let v = vEvent.nodes[k];
            if(v != undefined && v != null){
                if(v.active == true)
                    v.emit(_event);
            }
        }
    }

    public distatch(_node:cc.Node,_event:string) {
        let vEvent = this._findEvent(_event);
        for(let k in vEvent.nodes){
            let v = vEvent.nodes[k];
            if(v == _node){
                vEvent.nodes.splice(k,1);
                break;
            }  
        }
        if(vEvent.nodes.length == 0){
            this._removeEvent(_event);
        }
    }

    private _findEvent(_event:string){
        for(let k in this.arrEvents){
            let v = this.arrEvents[k];
            if(v.event == _event){
                return v;
            }
        }
        return null;
    }

    private _removeEvent(_event:string){
        this.arrEvents.forEach(function(item, index, arr) {
            if(item.event == _event) {
                arr.splice(index, 1);
            }
        });
    }

    // update (dt) {}
}
