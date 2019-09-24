//房间pageview页面管理器

cc.Class({
    extends: cc.Component,

    properties: {
        item_prefab:{  //项的资源预制体
            type:cc.Prefab,
            default:null,
        },
        chooseNode : cc.Node,
        starSpFrame:cc.SpriteFrame,
        starDiSpFrame:cc.SpriteFrame,
        MAX_COLOUM:5,        //列数
        MAX_PAGE_COUNT:10,       //每页可显示最多个数
        GAP_W:30,               //格子宽间距
        GAP_H:50,              //格子高间距
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.content = cc.find("view/content",this.node);
        this.itemList = []
        this.pageCount = 0
    },

    start () {

    },

    /*
        Func: 添加item
        p1:显示类型，1.开启状态 2.关闭状态
        p2:开启状态下的显示文本
        p3:星星等级
        p4:集合下标
        p5:关卡下标
    */
    addItem : function(_type,_content,_starLevel,_uIdx,_gIdx){
        
        let itemPrefab = cc.instantiate(this.item_prefab);
        let label = cc.find("bg/l_guanqia",itemPrefab)
        let img_suo = cc.find("bg/suo",itemPrefab)
        let node_star = cc.find("bg/nStar",itemPrefab)
        //itemPrefab.uIdx = _uIdx;
        //itemPrefab.gIdx = _gIdx;
        //itemPrefab.starLevel = _starLevel;
        let sId = _starLevel < 3 ? _starLevel + 1 : _starLevel  //最低是0星
        let cfgId = _uIdx * 1000 + _gIdx * 10 + sId; //关卡配置ID
        if(_type == 1)
        {
            img_suo.active = false
            label.active = true
            node_star.active = true
            label.getComponent(cc.Label).string = _content
           // let spFrameStar = new cc.SpriteFrame(cc.url.raw("resources/SceneRes/Choose/star.png"));
           // let spFrameStarDi = new cc.SpriteFrame(cc.url.raw("resources/SceneRes/Choose/xignxing_di.png"));
            for(let i = 1; i <= 3; i++){
                let spStar = cc.find("star" + i,node_star).getComponent(cc.Sprite);
                if(i <= _starLevel){
                   // cc.loader.loadRes("SceneRes/Choose/star",cc.SpriteFrame,function(err,spriteFrame){
                        spStar.spriteFrame = this.starSpFrame;
                    //});
                }
                else{
                    //cc.loader.loadRes("SceneRes/Choose/xignxing_di",cc.SpriteFrame,function(err,spriteFrame){
                        spStar.spriteFrame = this.starDiSpFrame;
                    //});
                }
            }
        }
        else if(_type == 2)
        {
            img_suo.active = true
            label.active = false
            node_star.active = false
        }
        this.itemList.push(itemPrefab)
        //以下是排版代码
        let curPage = Math.ceil(this.itemList.length / this.MAX_PAGE_COUNT)
        //添加新页面
        if(curPage > this.pageCount)
        {
            cc.log("!!!!!!!!!!!!!!!!!!!!!!!!!add page")
            //隐藏上一页的锁
            let lockNode = cc.find("view/content/page_" + this.pageCount + "/lockNode",this.node);
            if(lockNode != undefined){
                lockNode.active = false
            }
            //
            let pageItem = cc.find("pageItem",this.node)
            let newPage = cc.instantiate(pageItem)
            //创建新页面
            this.pageCount = curPage;
            newPage.active = true;
            newPage.name = "page_" + curPage;
            this.node.getComponent(cc.PageView).addPage(newPage);
            lockNode = newPage.getChildByName("lockNode");
            lockNode.active = true;
        }
        let pageUrl = "view/content/page_" + this.pageCount
        let page = cc.find(pageUrl,this.node)
        page.addChild(itemPrefab)
        let idx = this.itemList.length % this.MAX_PAGE_COUNT
        if(idx == 0)
        {
            idx = this.MAX_PAGE_COUNT
        }
        let initPosX = 180
        let initPosY = 550
        let gapW = this.GAP_W
        let gapH = this.GAP_H
        let row = Math.ceil(idx / this.MAX_COLOUM)
        let col = idx % this.MAX_COLOUM
        let itemBg = itemPrefab.getChildByName("bg")
        let itemWidth = itemBg.width
        let itemHeight = itemBg.height
        if(col == 0)
        {
            col = this.MAX_COLOUM
        }
        //cc.log("row = " + row + " col = " + col)
        //cc.log("width = " + itemPrefab.width  + " height = " + itemPrefab.height)
        let posX = initPosX + (itemWidth + gapW) * (col - 1)
        let posY = initPosY - (itemHeight + gapH) * (row - 1)
       // cc.log("posX = " + posX + " posY = " + posY)
        itemPrefab.setPosition(cc.v2(posX,posY))
        //添加点击事件
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.chooseNode;
        clickEventHandler.component = "Choose";
        clickEventHandler.handler = "OnPageViewItemClick";
        clickEventHandler.customEventData = cfgId;
        let button = itemPrefab.getComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);
    }

    // update (dt) {},
});
