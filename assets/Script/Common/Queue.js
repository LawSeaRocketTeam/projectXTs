//队列类
var Queue = cc.Class({
   ctor : function(){
        this.queue = [];
        this.offset = 0;
   },

   getLength : function(){
       return (this.queue.length - this.offset);
   },

   isEmpty : function(){
       return (this.queue.length == 0);
   },

   enqueue : function(_item){
        this.queue.push(_item);
   },

   dequeue : function(){
        if(this.queue.length == 0) return undefined;

        var item = this.queue[this.offset];

        if(++this.offset * 2 > this.queue.length){
            this.queue = this.queue.slice(this.offset);
            this.offset = 0;
        }
        return item;
   },

   peek : function(){
       return (this.queue.length > 0 ? this.queue[this.offset]:undefined);
   },

   reset : function(){
       this.queue = [];
       this.offset = 0;
   }
});

module.exports = Queue;