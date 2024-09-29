import {
  Scene,
  Color,
  Mesh,
  MeshNormalMaterial,
  BoxBufferGeometry,
  PerspectiveCamera,
  WebGLRenderer,
  OrthographicCamera,
  Clock,
  AudioListener,
  Vector2
} from "three";
import CubeScreen from "./screen";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import DigitalNumber from "./number";
import Tetris from './gameLogic';
import Score from "./score";
class Main {
  /** The scene */
  public scene: Scene;

  /** The camera */
  public camera: PerspectiveCamera | OrthographicCamera;

  /** The renderer */
  public renderer: WebGLRenderer;

  /** The orbit controls */
  public controls: OrbitControls;

  /** The cube mesh */
  public cube: Mesh;

  public screen: CubeScreen;

  public tetris: Tetris;

  pause:boolean;

  clock: Clock;
  gameTime:number;

  touchStart:Vector2;
  touchEnd:Vector2;

  
  constructor() {
    this.initViewport();
  }

  /** Initialize the viewport */
  public initViewport() {
    this.pause = false;
    this.clock = new Clock();
    // Init scene.
    this.scene = new Scene();
    this.gameTime = 0;
    this.scene.background = new Color("#566356");

    // Init camera.
    const aspect = window.innerWidth / window.innerHeight;
    const windowHeight = window.innerHeight;
    
    // this.camera = new PerspectiveCamera(60, aspect, 0.1, 100);

    const basicHeight = 32;
    const PixelPerUnit = windowHeight/basicHeight;
    console.log('pixelPerUnit',PixelPerUnit)
    const basicWidth = basicHeight * aspect;
    this.camera = new OrthographicCamera(-basicWidth/2,basicWidth/2,basicHeight/2,-basicHeight/2,0.1,20);
    this.camera.position.z = 10;

    const listener = new AudioListener();
    this.camera.add(listener);

    // Init renderer.
    this.renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
   
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener("resize", () => this.onResize());


    // Init orbit controls.
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();
    this.controls.enabled = false;
    // this.controls.addEventListener("change", () => this.render());
    
    
    // Add test mesh.
    this.cube = this.createCubeMesh();
    const screenWidth = 12;
    const screenHeight = 24;
    const blockWidth = 0.8;
    const blockPadding = 0.05;
    
    const screen = new CubeScreen(screenWidth,screenHeight,blockWidth,blockPadding,PixelPerUnit);
    screen.renderObj.position.set(-(screenWidth*(blockWidth+blockPadding))/2 + blockWidth/2,basicHeight/2 - 4,0);
    this.screen = screen;
    this.scene.add(screen.renderObj);
    
    const score = new Score(6);
    score.updateNumber(0);
    score.renderObj.position.set(0, basicHeight/2-3, 0);
    score.renderObj.scale.set(0.3,0.3,0.3);
    this.scene.add(score.renderObj);
    this.tetris = new Tetris(screenWidth,screenHeight,listener);

    this.tetris.addEventListener("scoreChanged",(e)=>{
      const newScore = e.message.score;
      score.updateNumber(newScore)
    })
    this.renderer.setAnimationLoop(() => this.animate()); // uncomment if you want to use the animation loop
    window.addEventListener("blur",()=>{
      this.pause = true;
      this.clock.stop();
    })

    window.addEventListener("focus",()=>{
      this.pause = false;
      this.clock.start();
    });
    this.addEvent();
  }

  actionWhenTouchMove(moveVec:Vector2){
    const absX = Math.abs(moveVec.x);
    const absY = Math.abs(moveVec.y);
    if( absX > absY ) {
      // move left or right
      if( moveVec.x < 0 ) {
        // move left;
        this.tetris.actionMoveLeft();
      } else {
        // move right
        this.tetris.actionMoveRight();
      }
    } else {
      if( moveVec.y > 0) {
        // move down
        this.tetris.actionMoveDown();
      } else {
        // move down or rotate
        this.tetris.actionRotate();
      }
      
    }
  }

  setAudio(){
    const listener = new AudioListener();
    this.camera.add(listener);
    
    return listener;
  }

  addEvent(){
    window.addEventListener("keydown",(e)=>{
      const key = e.key.toUpperCase();
      console.log('key down')
      if( e.code === "Space"){
        this.tetris.actionRotate();
        return;
      }
      switch(key){
        case 'A':
          this.tetris.actionMoveLeft();
          
          break;
        case 'S':
          this.tetris.actionMoveDown();
          break;
        case 'D':
          this.tetris.actionMoveRight();
          break;
      }
    })
    const startButton = document.getElementById("startButton");
    if( startButton ) {
      startButton.addEventListener("click",()=>{
        if( this.tetris.gameState === "process" ) {
          
          // this.clock.start();
          // this.tetris.reStart();
        } else {
          this.tetris.reStart();
          if( !document.fullscreenElement ){
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        }
        
        
        // startButton.hidden = true;
      })
    }
    this.addTouchEvent();
  }

  addTouchEvent(){
    // when touch end to top , rotate
    window.document.addEventListener("touchstart",(e)=>{
      // will store touch start event position and end direction
      console.log("touch start",e)
      for( let i = 0; i < e.touches.length; i++ ) {
        if( i === 0 ) {
          this.touchStart = new Vector2(e.touches[i].clientX, e.touches[i].clientY);
        }
      }
    })

    window.document.addEventListener("touchend",(e)=>{
      for( let i = 0; i < e.changedTouches.length; i++ ) {
        if( i === 0 ) {
          this.touchEnd = new Vector2(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        }
      }
      const moveVec = this.touchEnd.clone().sub(this.touchStart);
      this.actionWhenTouchMove(moveVec);
    })
  }

  /** Renders the scene */
  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  /** Animates the scene */
  public animate() {
    if(this.pause) return;
    this.controls.update();
    this.logicUpdate();
    this.screen.update();
    this.renderer.render(this.scene, this.camera);

  }

  logicUpdate(){
    const delta = this.clock.getDelta();
    this.gameTime += delta;
    
    const currentTime = this.clock.getElapsedTime();
    this.screen.setAlpha(this.tetris.outputBlockBuffer)
    this.tetris.update(delta, this.gameTime);
  }

  makeExampleScreen(){
    const screenArray = new Array(8*16).fill(0);
    screenArray[3] = 1;
    this.screen.setAlpha(screenArray);
  }

  /** On resize event */
  public onResize() {
    if (this.camera instanceof PerspectiveCamera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    if( this.camera instanceof OrthographicCamera ) {
      const aspect = window.innerWidth / window.innerHeight;

      const basicHeight = 32;
      const PixelPerUnit = window.innerHeight/basicHeight;
      const basicWidth = basicHeight * aspect;
      this.camera.left = -basicWidth/2;
      this.camera.right = basicWidth/2;
      this.camera.top = basicHeight/2;
      this.camera.bottom = -basicHeight/2;
      this.camera.updateProjectionMatrix();
      this.screen.resetPixelSize(PixelPerUnit);
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.render();
  }

  /** Creates a cube mesh */
  public createCubeMesh() {
    const geometry = new BoxBufferGeometry(1, 1, 1);
    const material = new MeshNormalMaterial();
    const mesh = new Mesh(geometry, material);
    return mesh;
  }

  
}

new Main();
