/**
 * this is viwer screen
 * create with squares with width and height
 * will control the block visible and invisible and transparent
 * 
 */
import { 
  Points,
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  DynamicDrawUsage,
  StaticDrawUsage,
  VertexColors
} from 'three'
export default class CubeScreen{
  screenSourceData:Array<number>;
  renderObj: Points;
  totalNumber:number;
  rows: number;
  columns: number;
  blockWidth: number;
  paddingWidth: number;
  private colorAttribute: Float32BufferAttribute;
  private transparentAttribute: Float32BufferAttribute;
  constructor(width:number, height:number, blockWidth:number = 1, paddingWidth:number = 0.){
    const totalNumber = width * height;
    this.blockWidth = blockWidth;
    this.paddingWidth = paddingWidth;

    this.columns = width;
    this.rows = height;
    
    this.screenSourceData = new Array(totalNumber).fill(0);
    this.totalNumber = totalNumber;
    this.createPoints();
  }

  /** Should generate a group of points */
  createPoints(){
    const vertices = [];
    const screenWidth = this.columns * (this.blockWidth + this.paddingWidth) - this.paddingWidth;
    const screenHeight = this.rows * (this.blockWidth + this.paddingWidth) - this.paddingWidth;
    const colors = [];
    const transparency = [];
    for( let i = 0; i < this.totalNumber; i++ ) {
      const x = (i % this.columns) * (this.blockWidth + this.paddingWidth);
      const y = -Math.floor(i / this.columns) * (this.blockWidth + this.paddingWidth) - this.blockWidth/2;
      const z = 0;
      vertices.push( x, y, z );
      colors.push( 0, 0, 0);
      transparency.push(0.05);
    }

    const pointsGeometry = new BufferGeometry();
    pointsGeometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ).setUsage( StaticDrawUsage ) );
    this.colorAttribute = new Float32BufferAttribute( colors, 3 ).setUsage( DynamicDrawUsage )
    pointsGeometry.setAttribute( 'color', this.colorAttribute );

    this.transparentAttribute = new Float32BufferAttribute(transparency, 1).setUsage( DynamicDrawUsage )
    pointsGeometry.setAttribute('vAlpha', this.transparentAttribute);
    const pointsMaterial = new PointsMaterial({
      size: 22,
      vertexColors: VertexColors,
      // sizeAttenuation:false,
      transparent: true,
      opacity: 1
    })
    pointsMaterial.onBeforeCompile = (shader)=>{
      shader.vertexShader = shader.vertexShader.replace("#include <color_pars_vertex>","#ifdef USE_COLOR\n\tvarying vec4 vColor;\n\tattribute float vAlpha;\n#endif");
      shader.vertexShader = shader.vertexShader.replace("#include <color_vertex>","#ifdef USE_COLOR\n\tvColor.xyz = color.xyz;\n\tvColor.w = vAlpha;\n#endif")
      shader.fragmentShader = shader.fragmentShader.replace("#include <color_pars_fragment>", "#ifdef USE_COLOR\n\tvarying vec4 vColor;\n#endif");
      shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>","#ifdef USE_COLOR\n\tdiffuseColor.rgba *= vColor;\n#endif")

    }
    const points = new Points(pointsGeometry, pointsMaterial);
    this.renderObj = points;
  }

  /** this function will update the color attribute accroding to the source data */
  updateColorAttribute(){
    for(let i = 0; i < this.totalNumber; i++ ){
      const color = this.screenSourceData[i] ? 1 : 0;
      this.colorAttribute.setXYZ(i, color, color, color);
    }
    this.colorAttribute.needsUpdate = true;
  }

  /** will update alpha attribute every frame */
  updateAlphaAttribute(){
    for( let i = 0; i <  this.totalNumber; i++ ) {
      const alpha = this.screenSourceData[i] ? 0.9 : 0.05;
      this.transparentAttribute.setX(i, alpha);
    }
    this.transparentAttribute.needsUpdate = true;
  }

  /** update the screen should call every render frame */
  update(){
    this.updateAlphaAttribute();
  }

  /** setScreen */
  setAlpha(array:Array<number>){
    if( array.length === this.transparentAttribute.array.length ) {
      for( let i = 0; i < array.length; i++ ) {
        this.screenSourceData[i] = array[i];
      }
    } else {
      console.error('set alpha should has the same length as the screen is')
    }
  }
}