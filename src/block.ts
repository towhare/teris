/**
 * define a group of types
 */
import { Color, Vector2 } from "three"

interface BlockType{
  rotationState:Array<Array<Array<number>>>,
  blockName:string
}
/** 5 types of block */
const blockTypes:BlockType[] = [
  //square
  {
    rotationState:[
      [
        [0,0],[1,0],
        [0,1],[1,1]
      ]
    ],
    blockName:"square"
  },
  // line
  {
    rotationState:[
      [
        [0,0],
        [0,1],
        [0,2],
        [0,3]
      ],
      [
        
        [-1,0],[0,0],[1,0],[2,0]
      ]
    ],
    blockName:"line"
  },
  //T
  {
    blockName:"T",
    rotationState:[
      [
        [0,0],
        [0,1],[1,1],
        [0,2]
      ],
      [
        [-1,1],[0,1],[1,1]
              ,[0,2]
      ],
      [
              [0,0],
       [-1,1],[0,1],
              [0,2]
      ],
      [
               [0,0],
        [-1,1],[0,1],[1,1]
      ]
    ]
  },
  {
    blockName:"leftL",
    rotationState:[
      [
        [0,0],[1,0]
             ,[1,1]
             ,[1,2]
      ],
      [
                     [1,0],
        [-1,1],[0,1],[1,1]
      ],
      [
        [0,0],
        [0,1],
        [0,2],[1,2]
      ],
      [
        [0,0],[1,0],[2,0],
        [0,1]
      ]
    ]
  },
  {
    blockName:"rightL",
    rotationState:[
      [
        [0,0],[1,0],
        [0,1],
        [0,2]
      ],
      [
        [-1,0],[0,0],[1,0]
                    ,[1,1]
      ],
      [
              [1,0],
              [1,1],
        [0,2],[1,2]
      ],
      [
        [0,0],
        [0,1],[1,1],[2,1]
      ]
    ]
  }
];
export default class Block{
  rotationState:Array<Array<Array<number>>>;
  public currentState:number;
  name:string;
  position:Vector2;
  color: Color;
  constructor(type:number){
    this.currentState = 0;
    this.name = blockTypes[type].blockName;
    this.rotationState = blockTypes[type].rotationState;
    this.position = new Vector2(0,0);
    this.color = new Color(0x000000);
  }

  rotate(){
    this.currentState = (this.currentState + 1) % this.rotationState.length;
  }

  /** get the next rotation state but won't change current state */
  getRotateState(step:number = 1) {
    const stateIndex = (this.currentState + step) % this.rotationState.length;
    return this.rotationState[stateIndex];
  }

  getCurrentState(){
    return this.rotationState[this.currentState];
  }

  setPosition(x:number,y:number){
    this.position.set(x,y);
  }
}