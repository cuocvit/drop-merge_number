import { _decorator, Component, EventKeyboard, find, Input, input, KeyCode, Label, Node, sp, Vec2, warn } from 'cc';
import { config } from './Config';
import { Render } from './Render';
import { ItemSpriteBlock, MusicEvent, NodeUrl } from './Enum';
import { BlockAudio } from './BlockAudio';


const { ccclass, property } = _decorator;

export interface CurrentShapeData {
    pos: Vec2,
    spriteBlock: ItemSpriteBlock
}

@ccclass('Main')
export class Main extends Component {

    @property(Render)
    renderClass: Render = undefined

    @property(Node)
    startPanel: Node = undefined

    @property(Label)
    scoreLabel: Label = undefined

    @property(BlockAudio)
    public clip: BlockAudio;

    private score: number = 0

    dataArray: ItemSpriteBlock[][] = []

    currentShape: CurrentShapeData = {
        pos: new Vec2(0, 0),
        spriteBlock: ItemSpriteBlock.NULL
    }

    time: number = 0

    isOpen: boolean = false

    onLoad(){
        this.scoreLabel.string = `Score: ${this.score}`;
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this.clip.audioQueue(1);
    }

   onKeyDown(event: EventKeyboard){
        this.clip.audioQueue(0);
        switch(event.keyCode){
            case KeyCode.ARROW_LEFT:
                this.changeCurrentShapePos(new Vec2(0, -1));
                //this.clip.onAudioQueue(0);
                break;
            case KeyCode.ARROW_RIGHT:
                this.changeCurrentShapePos(new Vec2(0, 1));
                //this.clip.onAudioQueue(0);
                break;
            case KeyCode.ARROW_DOWN:
                this.changeCurrentShapePos(new Vec2(1, 0));
                //this.clip.onAudioQueue(0);
                break;
        }
   }

    gameStart(){
        this.startPanel.active = false
        this.initData()
        this.render()
        this.randomOneShape()
        this.isOpen = true
    }

    initData(){
        for(let i = 0; i < config.row; i++){
            this.dataArray[i] = []
            for(let j = 0; j < config.col; j++){
                this.dataArray[i][j] = ItemSpriteBlock.NULL
            }
        }
    }

    clearCurrentData (currentShape: CurrentShapeData) {
        const { pos, spriteBlock} = currentShape
        const row = pos.x
        const col = pos.y
        this.dataArray[row][col] = ItemSpriteBlock.NULL
    }

    randomOneShape(){
        this.currentShape.pos.set(config.startPos)
        this.currentShape.spriteBlock = 1+ this.randomSpriteIndex()

        if(this.isCurrentShapeCanPut(this.currentShape)){
            this.setCurrentData(this.currentShape)
            console.log('isCurrentShapeCanPut')
        }
        else{
            this.clip.audioQueue(3);
            warn('Game Over')
            this.isOpen = false
            this.setCurrentData(this.currentShape)
            this.scheduleOnce(() => {
                // 显示游戏开始菜单
                this.startPanel.active = true
            }, 2)
        }
    }

    randomSpriteIndex() {
        const blocks = [
            { value: 0, weight: 40 }, //2
            { value: 1, weight: 30 }, //4
            { value: 2, weight: 30 }, //8
            { value: 3, weight: 30 },  //16
            { value: 4, weight: 20 },  //32
            { value: 5, weight: 20 },  //64      
            { value: 6, weight: 3 },  //128    
            { value: 7, weight: 2 },  //256
            { value: 8, weight: 1 },  //512
        ];
    
        const totalWeight = blocks.reduce((acc, block) => acc + block.weight, 0);
        const random = Math.random() * totalWeight;
    
        let cumulativeWeight = 0;
        for (const block of blocks) {
            cumulativeWeight += block.weight;
            if (random < cumulativeWeight) {
                return block.value;
            }
        }
        return blocks[0].value; 
    }


    isCurrentShapeCanPut(currentShape: CurrentShapeData){
        const {pos, spriteBlock} = currentShape
        const row = pos.x
        const col = pos.y

        if(row < 0 || row >= config.row || col < 0 || col >= config.col){
            return false
        }

        if(this.dataArray[row][col] != ItemSpriteBlock.NULL){
            return false
        }

        return true
    }

    setCurrentData(currentShape: CurrentShapeData){
        const{pos, spriteBlock} = currentShape
        const row = pos.x
        const col = pos.y
        this.dataArray[row][col] = spriteBlock

        
        this.render()
    }

    changeCurrentShapePos(v: Vec2){
        this.clearCurrentData(this.currentShape)
        this.currentShape.pos.x += v.x
        this.currentShape.pos.y += v.y
        if(this.isCurrentShapeCanPut(this.currentShape)){
            this.setCurrentData(this.currentShape)
        }
        else{
            this.currentShape.pos.x -= v.x
            this.currentShape.pos.y -= v.y
        }
    }

    autoDown () {
        this.clearCurrentData(this.currentShape)
        this.currentShape.pos.x += 1
        if (this.isCurrentShapeCanPut(this.currentShape)) {
            this.setCurrentData(this.currentShape)
        } else {
            this.currentShape.pos.x -= 1
            this.setCurrentData(this.currentShape)
            this.mergeBlocks(this.currentShape.pos)
            this.randomOneShape()
        }
    }

    mergeBlocks(shapePos: Vec2) {
        const currentValue = this.dataArray[shapePos.x][shapePos.y];

        this.clip.audioQueue(2);
        
        if(shapePos.x + 1 < config.row &&  this.dataArray[shapePos.x][shapePos.y] === this.dataArray[shapePos.x + 1][shapePos.y]){
            console.log('Bên duới')
            if(shapePos.y - 1 >= 0 && shapePos.y + 1 < config.col &&
                this.dataArray[shapePos.x][shapePos.y] === this.dataArray[shapePos.x][shapePos.y + 1] && 
                this.dataArray[shapePos.x][shapePos.y] === this.dataArray[shapePos.x][shapePos.y - 1]
            ){
                this.dataArray[shapePos.x][shapePos.y] += 3
                this.dataArray[shapePos.x + 1][shapePos.y] = ItemSpriteBlock.NULL
                this.dataArray[shapePos.x][shapePos.y - 1] = ItemSpriteBlock.NULL
                this.dataArray[shapePos.x][shapePos.y + 1] = ItemSpriteBlock.NULL

                this.score += Math.pow(2, this.dataArray[shapePos.x][shapePos.y])
            }
            else if(shapePos.y + 1 < config.col &&
                this.dataArray[shapePos.x][shapePos.y] === this.dataArray[shapePos.x][shapePos.y + 1]
            ){
                this.dataArray[shapePos.x][shapePos.y] += 2
                this.dataArray[shapePos.x + 1][shapePos.y] = ItemSpriteBlock.NULL
                this.dataArray[shapePos.x][shapePos.y + 1] = ItemSpriteBlock.NULL

                this.score += Math.pow(2, this.dataArray[shapePos.x][shapePos.y])
            }
            else if(shapePos.y - 1 >= 0 &&
                this.dataArray[shapePos.x][shapePos.y] === this.dataArray[shapePos.x][shapePos.y - 1]
            ){
                this.dataArray[shapePos.x][shapePos.y] += 2
                this.dataArray[shapePos.x + 1][shapePos.y] = ItemSpriteBlock.NULL
                this.dataArray[shapePos.x][shapePos.y - 1] = ItemSpriteBlock.NULL

                this.score += Math.pow(2, this.dataArray[shapePos.x][shapePos.y])

            }
            else{
                this.dataArray[shapePos.x][shapePos.y] += 1
                this.dataArray[shapePos.x + 1][shapePos.y] = ItemSpriteBlock.NULL

                this.score += Math.pow(2, this.dataArray[shapePos.x][shapePos.y])
            }
        }
        else{
            if(shapePos.y - 1 >= 0 && shapePos.y + 1 < config.col &&
                this.dataArray[shapePos.x][shapePos.y] === this.dataArray[shapePos.x][shapePos.y + 1] && 
                this.dataArray[shapePos.x][shapePos.y] === this.dataArray[shapePos.x][shapePos.y - 1]
            ){
                this.dataArray[shapePos.x][shapePos.y] += 2
                this.dataArray[shapePos.x][shapePos.y - 1] = ItemSpriteBlock.NULL
                this.dataArray[shapePos.x][shapePos.y + 1] = ItemSpriteBlock.NULL

                this.score += Math.pow(2, this.dataArray[shapePos.x][shapePos.y])
            }
            else if(shapePos.y + 1 < config.col &&
                this.dataArray[shapePos.x][shapePos.y] === this.dataArray[shapePos.x][shapePos.y + 1]
            ){
                this.dataArray[shapePos.x][shapePos.y] += 1
                this.dataArray[shapePos.x][shapePos.y + 1] = ItemSpriteBlock.NULL

                //this.shiftBlocksLeft(true, new Vec2(shapePos.x, shapePos.y))
                

                this.score += Math.pow(2, this.dataArray[shapePos.x][shapePos.y])

                this.checkAdjacentBlocks(shapePos)
            }
            else if(shapePos.y - 1 >= 0 &&
                this.dataArray[shapePos.x][shapePos.y] === this.dataArray[shapePos.x][shapePos.y - 1]
            ){
                this.dataArray[shapePos.x][shapePos.y] += 1
                this.dataArray[shapePos.x][shapePos.y - 1] = ItemSpriteBlock.NULL

                this.score += Math.pow(2, this.dataArray[shapePos.x][shapePos.y])

                this.checkAdjacentBlocks(shapePos)
            }
        }
        // // Bên trái và bên phải
        // if (shapePos.x - 1 >= 0 && shapePos.x + 1 < config.row &&
        //     currentValue === this.dataArray[shapePos.x][shapePos.y + 1] ||
        //     currentValue === this.dataArray[shapePos.x][shapePos.y - 1]) {
             
        //     console.log('Bên trái và bên phải')
        //     this.dataArray[shapePos.x][shapePos.y] += 2;
        //     this.dataArray[shapePos.x][shapePos.y - 1] = ItemSpriteBlock.NULL;
        //     this.dataArray[shapePos.x][shapePos.y + 1] = ItemSpriteBlock.NULL;
        //     //this.goBlockDown()
        // }
        
        // // Bên trái và phía dưới
        // if (shapePos.x - 1 >= 0 && shapePos.y - 1 >= 0 &&
        //     currentValue === this.dataArray[shapePos.x - 1][shapePos.y] &&
        //     currentValue === this.dataArray[shapePos.x][shapePos.y - 1] &&
        //     currentValue !== ItemSpriteBlock.NULL) {
            
        //     this.dataArray[shapePos.x][shapePos.y] += 2;
        //     this.dataArray[shapePos.x - 1][shapePos.y] = ItemSpriteBlock.NULL;
        //     this.dataArray[shapePos.x][shapePos.y - 1] = ItemSpriteBlock.NULL;
        //     //this.goBlockDown()
        // }
        
        // // Bên phải và phía dưới
        // if (shapePos.x + 1 < config.row && shapePos.y - 1 >= 0 &&
        //     currentValue === this.dataArray[shapePos.x + 1][shapePos.y] &&
        //     currentValue === this.dataArray[shapePos.x][shapePos.y - 1] &&
        //     currentValue !== ItemSpriteBlock.NULL) {
            
        //     this.dataArray[shapePos.x][shapePos.y] += 2;
        //     this.dataArray[shapePos.x + 1][shapePos.y] = ItemSpriteBlock.NULL;
        //     this.dataArray[shapePos.x][shapePos.y - 1] = ItemSpriteBlock.NULL;
        //     //this.goBlockDown()
        // }
    
        // // Ở dưới
        // if (shapePos.y - 1 >= 0 &&
        //     currentValue === this.dataArray[shapePos.x][shapePos.y - 1] &&
        //     currentValue !== ItemSpriteBlock.NULL) {
            
        //     this.dataArray[shapePos.x][shapePos.y] += 1;
        //     this.dataArray[shapePos.x][shapePos.y - 1] = ItemSpriteBlock.NULL;
        //     //this.goBlockDown()
        // }
    
        // // Ở bên trái
        // if (shapePos.x - 1 >= 0 &&
        //     currentValue === this.dataArray[shapePos.x - 1][shapePos.y] &&
        //     currentValue !== ItemSpriteBlock.NULL) {
            
        //     this.dataArray[shapePos.x][shapePos.y] += 1;
        //     this.dataArray[shapePos.x - 1][shapePos.y] = ItemSpriteBlock.NULL;
        //     //this.goBlockDown()
        // }
    
        // // Ở bên phải
        // if (shapePos.x + 1 < config.row &&
        //     currentValue === this.dataArray[shapePos.x + 1][shapePos.y] &&
        //     currentValue !== ItemSpriteBlock.NULL) {
            
        //     this.dataArray[shapePos.x][shapePos.y] += 1;
        //     this.dataArray[shapePos.x + 1][shapePos.y] = ItemSpriteBlock.NULL;
        //     //this.goBlockDown()
        // }
    
        // Render lại sau khi hợp nhất
        this.shiftBlocksDown();
        //this.shiftBlocksLeft(shapePos);

        

        this.render();
        return true;
    }

    shiftBlocksDown() {
        let merged = false;
        // Lặp qua tất cả các cột
        for (let col = 0; col < config.col; col++) {
            // Kiểm tra từ dưới lên trên để di chuyển các block xuống
            for (let row = config.row - 1; row > 0; row--) {
                if (this.dataArray[row][col] === ItemSpriteBlock.NULL) {
                    // Di chuyển block từ hàng trên xuống nếu vị trí hiện tại trống
                    this.dataArray[row][col] = this.dataArray[row - 1][col];
                    this.dataArray[row - 1][col] = ItemSpriteBlock.NULL;
                    
                    // Gọi hàm merge sau khi block rơi xuống vị trí mới
                    if (!merged && this.dataArray[row][col] !== ItemSpriteBlock.NULL) {
                        merged = this.mergeBlocks(new Vec2(row, col));
                    }
                }
            }
        }
        if (merged) {
            // Nếu có merge, tiếp tục gọi lại để các block tiếp tục rơi nếu có khoảng trống
            this.shiftBlocksDown();
        }
    }
    
    checkAdjacentBlocks(shapePos: Vec2) {
        const currentValue = this.dataArray[shapePos.x][shapePos.y];
    
        // Kiểm tra block bên dưới
        if ((shapePos.y + 1 < config.col && this.dataArray[shapePos.x][shapePos.y + 1] !== ItemSpriteBlock.NULL) ||
            (shapePos.y - 1 >= 0 && this.dataArray[shapePos.x][shapePos.y - 1] !== ItemSpriteBlock.NULL)
        ) {
            // this.dataArray[shapePos.x][shapePos.y] += 1;
            // this.dataArray[shapePos.x + 1][shapePos.y] = ItemSpriteBlock.NULL;
            // this.score += Math.pow(2, this.dataArray[shapePos.x][shapePos.y]);
            
            // // Sau khi merge tiếp, tiếp tục kiểm tra
            // this.checkAdjacentBlocks(shapePos);
            this.mergeBlocks(shapePos);
        }
    }

    shiftBlocksLeft(shapePos: Vec2) {
        let mergedLeft = false;
    
        // Kiểm tra điều kiện trước khi gọi merge
        if (this.dataArray[shapePos.x][shapePos.y] !== ItemSpriteBlock.NULL) {
            if (!mergedLeft &&
                (shapePos.y + 1 < config.col && this.dataArray[shapePos.x][shapePos.y + 1] !== ItemSpriteBlock.NULL) ||
                (shapePos.y - 1 >= 0 && this.dataArray[shapePos.x][shapePos.y - 1] !== ItemSpriteBlock.NULL) ||
                (shapePos.x + 1 < config.row && this.dataArray[shapePos.x + 1][shapePos.y] !== ItemSpriteBlock.NULL)
            ) {
                mergedLeft = this.mergeBlocks(shapePos);
            }
        }
    
        // Chỉ gọi lại đệ quy nếu có merge
        if (mergedLeft) {
            //this.shiftBlocksDown();
            this.shiftBlocksLeft(new Vec2(shapePos.x, shapePos.y));
        }
    }

    update(dt: number) {
        if (!this.isOpen) {
            return
        }
        this.time += dt
        if (this.time > 1.1) {
            this.time = 0
            // 下落逻辑
            //this.goBlockDown()
            this.autoDown()
        }
        this.scoreLabel.string = `Score: ${this.score}`
    }

    render () {
        this.renderClass.render(this.dataArray)
    }
}


