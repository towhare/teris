
import {
  AudioLoader,
  Audio,
  AudioListener
} from 'three';

import { EffectType } from './constant';
export default class AudioPlayer{
  audioLoader: AudioLoader;
  audioMap:Map<EffectType,AudioBuffer>;
  audioLoaded:boolean;
  listener: AudioListener;
  audioTracks:Map<EffectType,Audio>;
  constructor(listener:AudioListener){
    this.audioLoader = new AudioLoader();
    this.audioLoaded = false;
    this.audioMap = new Map();
    this.listener = listener;
    this.audioTracks = new Map();
  }

  /** */
  async loadAllAudio(){
    
    const moveBuffer = await this.loadSource("public/sound/move.mp3");
    this.audioMap.set(EffectType.Move,moveBuffer);
    this.audioTracks.set(EffectType.Move, new Audio(this.listener));

    const blockBuffer = await this.loadSource("public/sound/block.mp3");
    this.audioMap.set(EffectType.Block, blockBuffer);
    this.audioTracks.set(EffectType.Block, new Audio(this.listener));

    const startBuffer = await this.loadSource("public/sound/start.mp3");
    this.audioMap.set(EffectType.Start, startBuffer); 
    this.audioTracks.set(EffectType.Start, new Audio(this.listener));

    const scoreBuffer = await this.loadSource("public/sound/score.mp3");
    this.audioMap.set(EffectType.Score, scoreBuffer);
    this.audioTracks.set(EffectType.Score, new Audio(this.listener));

    const loseBuffer = await this.loadSource("public/sound/lose.mp3");
    this.audioMap.set(EffectType.Lose, loseBuffer);
    this.audioTracks.set(EffectType.Lose, new Audio(this.listener));

    console.log('audio load finished')
  }

  playSound(name:EffectType, volume:number = 1){
    const soundBuffer = this.audioMap.get(name);
    const audioTrack = this.audioTracks.get(name);
    console.log('play sound: type',name)
    if( !name || !soundBuffer || !audioTrack) {
      console.warn("Can not get audio Buffer",name)
    } else {
      console.log('audio')
      if( audioTrack.isPlaying ) {
        console.log('audio is')
        audioTrack.stop();
      }
      audioTrack.setBuffer(soundBuffer);
      audioTrack.setLoop(false);
      audioTrack.setVolume(volume);
      audioTrack.play();
    }
  }

  loadSource(str:string):Promise<AudioBuffer>{
    return new Promise((resolve,reject)=>{
      this.audioLoader.load(str,( buffer )=>{
        resolve(buffer);
      },()=>{

      },(error)=>{
        reject(error)
      })
    })
  }
}