import { _decorator, BoxCollider2D, Collider2D, Component, EventKeyboard, find, instantiate, IPhysics2DContact, KeyCode, Node, Prefab, RigidBody, RigidBody2D, Size, size, UITransform, Vec2, Vec3 } from 'cc';
import { Blocks } from './Blocks';
const { ccclass, property } = _decorator;

@ccclass('GameCtrl')
export class GameCtrl extends Component {

    @property
    speed: number = 100;

    @property(Prefab)
    blockPrefab: Prefab;

    public block: Blocks = null;

    public onMove: boolean = true;

    public activeBlock: Blocks = null;

    public lastBlockPosX: number = -1.5;

    public blocksArray: number[][]  = [];


    createBlock() {
        const block = instantiate(this.blockPrefab);
        //this.node.setScale(new Vec3(0.5, 0.5, 1));
        const canvas = find("Canvas")
        block.setParent(canvas); 
        
        block.setPosition(new Vec3(this.lastBlockPosX, 240, 0))
        console.log('lastPostX khi tao block',this.block.lastBlockPosX);

        return block;
    }

    randomIndexLocation(){
        
    }
    
    initData(){
        this.blocksArray = [];
        for(let i = 0; i < 5; i++){
            this.blocksArray[i] = [];  // Mỗi hàng là một mảng riêng biệt
            for(let j = 0; j < 6; j++){
                this.blocksArray[i][j] = 0;  // 0 có nghĩa là ô trống
            }
        }
    }
    
    

    protected onLoad(): void {
        this.block = find("Canvas/Blocks").getComponent(Blocks);
        this.initData();
    }

    public setOnMove(){
        this.onMove = true;
    }

    
    setActiveBlock(block: Blocks) {
        this.activeBlock = block;
    }

    
    isActiveBlock(block: Blocks): boolean {
        return this.activeBlock === block;
    }


    update(deltaTime: number) {
        if(this.onMove){ 
            const block = this.createBlock()
            this.onMove = false;   
            this.setActiveBlock(block.getComponent(Blocks));
        }
    }
}


