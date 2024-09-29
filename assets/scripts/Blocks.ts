import { _decorator, BoxCollider2D, Collider, Collider2D, Component, Contact2DType, director, EPhysics2DDrawFlags, EventKeyboard, find, Game, Input, input, IPhysics2DContact, KeyCode, Node, PhysicsSystem2D, random, Rect, RigidBody2D, Size, size, sp, Sprite, SpriteFrame, UITransform, Vec2, Vec3 } from 'cc';
import{GameCtrl} from './GameCtrl';
const { ccclass, property } = _decorator;


@ccclass('Blocks')
export class Blocks extends Component {
    
    @property([SpriteFrame])
    blockSprite: SpriteFrame[] = [];
    
    @property
    speed: number = 100;

    public value: number = 0;

    public currentPos = 0

    public hitSomething: boolean;

    public gameCtrl: GameCtrl = null;
    
    private hasCollided: boolean = false;
    
    public lastBlockPosX: number = -1.5;
    protected onLoad(): void {

        PhysicsSystem2D.instance.enable = true;

        PhysicsSystem2D.instance.debugDrawFlags = 
            EPhysics2DDrawFlags.Shape | 
            EPhysics2DDrawFlags.Joint | 
            EPhysics2DDrawFlags.Aabb;

        this.gameCtrl = find("Canvas/GameCtrl").getComponent(GameCtrl);

        const collider = this.getComponent(Collider2D);
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);


        this.createBlockSprite();
        this.node.getComponent(UITransform).contentSize =new Size(82,82)
        this.node.getComponent(BoxCollider2D).size = new Size(84, 84)

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        //input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
    }

    createBlockSprite() {
        let sprite = this.node.getComponent(Sprite);
        sprite.spriteFrame = this.blockSprite[this.randomSpriteIndex()];
        this.value = parseInt(sprite.spriteFrame.name);
        return sprite;
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

    onKeyDown(event: EventKeyboard) {
        if (!this.gameCtrl.isActiveBlock(this) || this.hasCollided) return; 

        switch (event.keyCode) {
            case KeyCode.ARROW_RIGHT:
                this.node.setPosition(this.node.position.add(new Vec3(85.5, 0, 0)));
                break;
            case KeyCode.ARROW_LEFT:
                this.node.setPosition(this.node.position.add(new Vec3(-85.5, 0, 0)));
                break;
            case KeyCode.ARROW_DOWN:
                this.speed = 2000; 
                break;
        }
    }
    
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (selfCollider.tag === 0 && otherCollider.tag === 0) {
            console.log("2 block va cham");
        }
        if (selfCollider.tag === 0 && otherCollider.tag === 1) {
            console.log("block va cham voi ground");
        }
        this.speed = 0;
        this.hasCollided = true;
        
        
        if (this.gameCtrl.isActiveBlock(this)) {
            this.gameCtrl.setActiveBlock(null); 
            this.gameCtrl.setOnMove(); 
        }

        // if (contact) {
        //     const worldManifold = contact.getWorldManifold();
        //     const normal = worldManifold.normal; // Đây là hướng của va chạm
            
        //     if (normal.x > 0) {
        //         console.log("Va chạm từ phía trái sang phải");
        //     } else if (normal.x < 0) {
        //         console.log("Va chạm từ phía phải sang trái");
        //     } else if (normal.y > 0) {
        //         console.log("Va chạm từ dưới lên trên");
        //     } else if (normal.y < 0) {
        //         console.log("Va chạm từ trên xuống dưới");
        //     }
        // }

        this.gameCtrl.lastBlockPosX = this.node.position.x;
        console.log(this.gameCtrl.lastBlockPosX)
    }
    
    protected update(dt: number): void {
        if (this.speed > 0) { 
            this.node.position = this.node.position.add(new Vec3(0, -this.speed * dt, 0));
        }
        this.currentPos = this.node.position.x
        //console.log(this.node.position)
        //console.log(this.checkNearbyBlocks())
    }

    checkNearbyBlocks(): {left: boolean, right: boolean, top: boolean, bottom: boolean} {
        const result = {left: false, right: false, top: false, bottom: false};
        const directions = {
            left: new Vec2(-1, 0),
            right: new Vec2(1, 0),
            top: new Vec2(0, 1),
            bottom: new Vec2(0, -1)
        };
        
        for (let dir in directions) {
            const hit = PhysicsSystem2D.instance.raycast(this.node.position, directions[dir], 'all');
            if (hit) result[dir] = true;
        }
    
        return result;
    }
    
}