/**
 * a score object show the score
 */
import {
  Object3D
} from "three";
import DigitalNumber from "./number";
export default class Score {
  totalLength:number;
  renderObj:Object3D;
  numbers: Array<DigitalNumber>;
 constructor(totalLength:number){
  this.totalLength = totalLength;
  this.numbers = [];
  this.renderObj = new Object3D();
  this.createNumbers();
 }

 createNumbers(){
  for( let i = 0; i < this.totalLength; i++ ){
      const newNumber = new DigitalNumber();
      newNumber.number = 0;
      newNumber.group.position.x = i * (2.6);
      this.renderObj.add(newNumber.group);
      this.numbers.push(newNumber);
    }
  }
 
  /** update number */
  updateNumber(num:number){
    const len = Math.ceil(Math.log(num+1)/Math.LN10);
    console.log(len);
    for( let i = 0; i < len; i++ ){
      const index = this.totalLength - 1 - i;
      const digit = Math.floor(num / Math.pow(10,i)) % 10;
      this.numbers[index].number = digit;
    }
  }
}