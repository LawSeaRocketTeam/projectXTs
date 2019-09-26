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
export default class GlobalMgr extends cc.Component {
    //定义一个单例
    private static instance: GlobalMgr;
    static getInstance (): GlobalMgr {
        if (!GlobalMgr.instance) {
            GlobalMgr.instance = new GlobalMgr()
        }
        return this.instance
    }
    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        EventDispatcher.getInstance().init();
        //cc.vv.i18n.init(cc.sys.language);
        cc.vv.i18n.init(cc.sys.language);
     }

    start () {
        //EventDispatcher.getInstance().init();
        //cc.vv.i18n.init(cc.sys.language);
    }

    // update (dt) {}
}
