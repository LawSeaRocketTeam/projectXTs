import BaseComponent from "../Base/BaseComponent";
import DataMgr from '../Base/DataMgr';
import MsgBox from '../Common/MsgBox'

const {ccclass, property} = cc._decorator;

@ccclass
export default class Choose extends BaseComponent {

    @property(cc.PageView)
    pageView: cc.PageView = null;

    rpMgr:any = null;   //ChoosePageViewMgr
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.rpMgr = this.pageView.getComponent("ChoosePageViewMgr")
    }

    onEnable(){
        this.refreshPageView();
        this.pageView.scrollToTop();
    }

    start () {

    }

    //刷新页面
    public refreshPageView(){
        this.pageView.removeAllPages();
        let data = DataMgr.getInstance().getGuanQiaData();
        for(let i = 0; i < data.length; i++)
        {
            let util = data[i];
            for(let j = 0; j < util.length; j++){
                let item = util[j];
                if(item.star >= 0){
                    this.rpMgr.addItem(1,j+1,item.star,i+1,j+1)
                }
                else{
                    this.rpMgr.addItem(2,i,j)
                }
            }
        }
        //滚动到最新页
        this.pageView.scrollToPage(data.length - 1,0.1);
    }

    //检测是否能开启下一个集合
    //所有关卡都通过并且达到一定的星星数
    public checkIsCanOpenNextUtils(){
        //获取当前页签
        let idx = this.pageView.getCurrentPageIndex();
        let data = DataMgr.getInstance().getGuanQiaData();
        let curUtil = data[idx];
        let starCount = 0;
        for(let j = 0; j < curUtil.length; j++){
            let item = curUtil[j];
            if(item.star <= 0)
               return false;
            starCount += item.star;
        }
        if(starCount < 18)//先随便写个数，之后跟配置
            return false;
        return true;
    }

    public onUnLockClick(event:any, customEventData:any){
        let idx = this.pageView.getCurrentPageIndex()+2;
        if(this.checkIsCanOpenNextUtils()){
            //添加新的集合，隐藏当前页面锁
            if(DataMgr.getInstance().addGuanQiaUtil(idx))
                this.refreshPageView();
        }
        else{
            //console.log("星星不足，不能解锁第" + idx + "集合，没获得三星的关卡都可以获取星星哦");
            // let sureFunc = function(event, customEventData){
            //     cc.log("点击事件测试")
            // };
            // cc.vv.msgBox.show(this.node,cc.vv.i18n.t("mb_more_star"),"测试","确定",sureFunc);
            MsgBox.getInstance().show(this.node,cc.vv.i18n.t("mb_more_star"));
        }
    }

    public OnPageViewItemClick(event:any, customEventData:any){
        //cc.log("OnPageViewItemClick :" + customEventData);
        let id:number = parseInt(customEventData)
        cc.vv.sceneParam.gameMode = "guanka";
        cc.vv.sceneParam.id = id;
        cc.director.loadScene("gameScene");
    }

    public onBackClick(event:any, customEventData:any){
        this.node.active = false;
    }

    // update (dt) {}
}
