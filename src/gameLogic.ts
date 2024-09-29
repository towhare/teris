/**
 * the basic game logic will return a array of number
 * logicframe
 */
import Block from './block';
import { EffectType } from './constant';
import { AudioListener,EventDispatcher } from "three";
import AudioPlayer from './audioPlayer';
export default class Tetris extends EventDispatcher{
  width: number;
  height: number;
  // drop speed 2 block per second?
  dropSpeed: number;
  // drop down every 0.5 second;
  dropTime: number;

  stableBlockBuffer: Array<number>;
  // current moving block buffer
  movingBlockBuffer: Array<number>;

  // Output block buffer 
  outputBlockBuffer: Array<number>;

  // Current control Block
  controlBlock:Block;

  gameState:"end"|"process";

  moveDownTime:number;

  audioPlayer: AudioPlayer;

  score: number;

  constructor(width: number, height:number, audioListener: AudioListener){
    super();
    this.width = width;
    this.height = height;
    this.stableBlockBuffer = new Array(width * height).fill(0);
    this.movingBlockBuffer = new Array(width * height).fill(1);
    this.outputBlockBuffer = new Array(width * height).fill(0);
    // block move speed could speed up when time gose by
    this.dropTime = 0.7;
    this.gameState = "end";
    this.moveDownTime = 0;
    this.score = 0;
    this.setAudioListener(audioListener);
  }
  start(){
    
    this.scoreChangeEvent()
    this.audioPlayer.playSound(EffectType.Start);
    setTimeout(()=>{
      this.gameState = "process";
      this.createBlock();
    },2000)
  }

  setAudioListener(audioListener:AudioListener){
    this.audioPlayer = new AudioPlayer(audioListener);
    this.audioPlayer.loadAllAudio();
  }

  updateOutputbuffer(){
    for( let i = 0; i < this.outputBlockBuffer.length; i++ ) {
      this.outputBlockBuffer[i] = (this.stableBlockBuffer[i] || this.movingBlockBuffer[i])?1:0;
    }
  }

  updateCurrentBlock(){
    if(!this.controlBlock) return;
    const x = this.controlBlock.position.x;
    const y = this.controlBlock.position.y;
    this.movingBlockBuffer.fill(0);

    const contorlBlockState = this.controlBlock.getCurrentState();
    for( let position of contorlBlockState ) {
      const newX = x + position[0];
      const newY = y + position[1];
      const index = newX + newY * this.width;
      if( index < 0 || index >= this.movingBlockBuffer.length ) {
        console.error('out of range')
      };
      this.movingBlockBuffer[index] = 1;
    }

  }

  /**
   * Create a new block on the top
   *  */
  createBlock(){
    // Reset moving block buffer
    this.movingBlockBuffer.fill(0);
    const random = Math.floor( Math.random() * 5);
    this.controlBlock = new Block(random);
    this.controlBlock.setPosition(Math.floor(this.width/2)-1,0);

    // When block was created ,check if this block clid any stable block, if current block intersect with any stable block, game over.
    if( this.checkBlockIntersection() ) {
      this.gameState = "end";
      
      this.audioPlayer.playSound(EffectType.Lose);
      console.log('game over');
      this.updateCurrentBlock();
      this.updateOutputbuffer();
    } else {

    }
  }

  // check if an item could move down
  preCheckCouldMoveDown():boolean{
    const nextStepX = this.controlBlock.position.x;
    const nextStepY = this.controlBlock.position.y + 1;
    // check every block if every block intersect with bottom bounding or the stable block buffer
    for( let position of this.controlBlock.getCurrentState() ) {
      const newX = nextStepX + position[0];
      const newY = nextStepY + position[1];
      if( newY >= this.height ) return false;
      if( this.stableBlockBuffer[newX + newY * this.width] ) return false;
    }
    return true;
  }

  checkBlockIntersection(){
    const x = this.controlBlock.position.x;
    const y = this.controlBlock.position.y;

    for( let position of this.controlBlock.getCurrentState() ) {
      const newX = x + position[0];
      const newY = y + position[1];
      if( this.stableBlockBuffer[newX + newY * this.width] ) return true;
    }
    return false;
  }

  /** Check if this block could move left */
  preCheckMoveLeft(){
    const nextStepX = this.controlBlock.position.x - 1;
    const nextStepY = this.controlBlock.position.y;

    for( let position of this.controlBlock.getCurrentState() ) {
      const newX = nextStepX + position[0];
      const newY = nextStepY + position[1];
      if( this.stableBlockBuffer[newX + newY * this.width] ) return false;
      if( newX < 0 ) return false;
    }
    return true;
  }

  preCheckMoveRight(){
    const nextStepX = this.controlBlock.position.x + 1;
    const nextStepY = this.controlBlock.position.y;

    for( let position of this.controlBlock.getCurrentState() ) {
      const newX = nextStepX + position[0];
      const newY = nextStepY + position[1];
      if( this.stableBlockBuffer[newX + newY * this.width] ) return false;
      if( newX >= this.width ) return false;
    }
    return true;
  }

  /** Check if a block could rotate */
  preCheckRotate(){
     // check if could rotate
     for( let position of this.controlBlock.getRotateState() ) {
      const newX = this.controlBlock.position.x + position[0];
      const newY = this.controlBlock.position.y + position[1];
      // intersect with stable block
      if( this.stableBlockBuffer[newX + newY * this.width] ) return false;
      if( newX < 0 || newX >= this.width || newY < 0 || newY >= this.height ) return false;
    }
    return true;
  }

  currentBlockMoveleft(){
    // should check if could move left
    if( this.preCheckMoveLeft() ) {
      this.audioPlayer.playSound(EffectType.Move);
      this.controlBlock.position.x -= 1;
    } else {
      this.audioPlayer.playSound(EffectType.Block);
    }
  }

  currentBlockMoveRight(){
    // check if could move right
    if( this.preCheckMoveRight() ) {
      this.audioPlayer.playSound(EffectType.Move);
      this.controlBlock.position.x += 1;
    } else {
      this.audioPlayer.playSound(EffectType.Block);
    }
  }

  

  currentBlockMoveDown(){
    // check if could move down check out this first
    if( this.preCheckCouldMoveDown() ) {
      this.audioPlayer.playSound(EffectType.Move);
      this.controlBlock.position.y += 1;
    } else {
      for( let position of this.controlBlock.getCurrentState() ) {
        const newX = this.controlBlock.position.x + position[0];
        const newY = this.controlBlock.position.y + position[1];
        this.stableBlockBuffer[newX + newY * this.width] = 1;
      }
      // check all stable blocks and remove line 
      const removed = this.stableBlockRemove();
      if( removed ) {
        this.audioPlayer.playSound(EffectType.Score);
      } else {
        this.audioPlayer.playSound(EffectType.Block);
      }
      // create new block
      this.createBlock();
    }
    // if could not move down, then this block was set create new block and change the stable block buffer
  }

  scoreChangeEvent(){
    this.dispatchEvent({type:"scoreChanged", message:{
      score:this.score
    }})
  }

  stableBlockRemove(){
    // find the remove group lines
    const removeIndexGroup = this.findRemoveLine();
    if( removeIndexGroup.length <= 0 ) {
      return false;
    }
    
    this.score += (removeIndexGroup.length * 100);
    this.scoreChangeEvent();
    let newStableBufferGroup = new Array(this.width * this.height).fill(0);
    let newLineIndex = this.height-1;
    for( let i = this.height-1; i > 0; i-- ) {
      //from last line to first line
      if( removeIndexGroup.indexOf(i) > -1 ) {
        // skip
        continue;
      } else {
        // set value
        for( let j = 0; j < this.width; j++ ) {
          newStableBufferGroup[newLineIndex * this.width + j] = this.stableBlockBuffer[i * this.width + j];
        }
        newLineIndex--;
      }
    }
    this.stableBlockBuffer = newStableBufferGroup;
    return true;
    
  }
  /** return line index should be removed */
  findRemoveLine():Array<number>{
    let removeGroup:Array<number> = [];
    for( let i = this.height - 1; i > 0; i-- ) {
      let couldRemove = false;
      let counts = 0;
      for( let j = 0; j < this.width; j++ ) {
        if(this.stableBlockBuffer[i * this.width + j] > 0){
          counts +=1;
        }
      }

      if( counts === this.width ) {
        couldRemove = true;
      }
      if( couldRemove ) removeGroup.push(i);
    }
    return removeGroup;
  }

  currentblockRotate(){
    if( this.preCheckRotate() ) {
      // Could rotate
      this.audioPlayer.playSound(EffectType.Move);
      this.controlBlock.rotate();
    } else {
      this.audioPlayer.playSound(EffectType.Block);
      // Could not rotate may play some sound effect
    }
  }

  /** fire a move left action */
  public actionMoveLeft(){
    if(this.gameState === "end"){
      return;
    }
    this.currentBlockMoveleft();
  }

  public actionMoveRight(){
    if(this.gameState === "end"){
      return;
    }
    this.currentBlockMoveRight();
  }

  public actionRotate(){
    if(this.gameState === "end"){
      return;
    }
    this.currentblockRotate();
  }

  /** fire a down move event usually active by controller/ control pad/ keyboard/ */
  actionMoveDown(){
    if(this.gameState === "end"){
      return;
    }
    this.currentBlockMoveDown();
  }

  reset(){
    this.stableBlockBuffer.fill(0);
    this.movingBlockBuffer.fill(0);
    this.outputBlockBuffer.fill(0);
    this.score = 0;
  }

  reStart(){
    this.reset();
    this.start();
  }

  continueMoveDown(delta:number){
    this.moveDownTime+=delta;
    if( this.moveDownTime >= this.dropTime ) {
      this.currentBlockMoveDown();
      this.moveDownTime = this.moveDownTime - this.dropTime;
    }
  }

  update(delta:number, currentTime:number){
    if( this.gameState === "end"){
      return;
    } else if( this.gameState === "process" ) {
      this.continueMoveDown(delta)
      this.updateCurrentBlock();
      this.updateOutputbuffer();
    }
  }
}