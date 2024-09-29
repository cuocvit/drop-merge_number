import { _decorator, Component, instantiate, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { config } from './Config';
import { ItemSpriteBlock } from './Enum';

const { ccclass, property } = _decorator;

@ccclass('Render')
export class Render extends Component {

    @property(Prefab)
    item: Prefab = undefined

    @property([SpriteFrame])
    itemSpriteFrames: SpriteFrame[] = []

    itemArray: Node[][] = []

    protected onLoad(): void {
        this.init()
    }

    init(){
        const height = config.row * config.blockHeight
        const width = config.col * config.blockWidth

        for(let i = 0; i < config.row; i++){
            this.itemArray[i] = []
            for(let j = 0; j < config.col; j++){
                const x = -width / 2 + config.blockWidth / 2 + j * config.blockWidth
                const y = height / 2 - config.blockHeight / 2 - i * config.blockHeight
                const item = this.createItem(x, y)
                this.itemArray[i][j] = item
            }
        }
    }

    render(dataArray: ItemSpriteBlock[][]){
        for(let i = 0; i < config.row; i++){
            for(let j = 0; j < config.col; j++){
                const item = dataArray[i][j]
                this.itemArray[i][j].getComponent(Sprite).spriteFrame = this.itemSpriteFrames[item - 1]
            }
        }
    }
    createItem(x: number, y: number): Node {
        const item = instantiate(this.item)
        item.setPosition(x, y)
        this.node.addChild(item)
        return item
    }
}


