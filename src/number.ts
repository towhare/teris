import {
  Uint32BufferAttribute,
  BufferGeometry,
  BufferAttribute,
  MeshBasicMaterial,
  Mesh,
  DoubleSide,
  Group,
  Object3D,
  Geometry
} from "three";
/** this class used for create a digital number group a */
export default class DigitalNumber {
  lightSetting: Array<Array<number>>;
  group: Object3D;
  _number: number;
  childrenGroup:Array<Mesh>;
  showMaterial:MeshBasicMaterial;
  hideMaterial:MeshBasicMaterial;
  constructor() {
    this.create();
    this.lightSetting = this.createLightSetting();
    this.showMaterial = new MeshBasicMaterial({color:0x000000, transparent:true, opacity:1});
    this.hideMaterial = new MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.05});
  }

  public create() {
    let points = new Float32Array([
      -0.9,
      0,
      0,

      -0.8,
      0.1,
      0,

      -0.8,
      -0.1,
      0,

      0.9,
      0,
      0,

      0.8,
      0.1,
      0,

      0.8,
      -0.1,
      0
    ]);
    // [0, 2, 1, 1, 2, 4, 2, 5, 4, 4, 5, 3]
    let faceIndex = new Uint32BufferAttribute(
      [0, 2, 1, 1, 2, 4, 2, 5, 4, 4, 5, 3],
      1
    );
    let geometry = new BufferGeometry();

    // let indexAttribute = new BufferAttribute(faceIndex2, 3);
    geometry.setIndex(faceIndex);
    geometry.setAttribute("position", new BufferAttribute(points, 3));
    geometry.computeVertexNormals();
    geometry.normalizeNormals();
    let normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);

    geometry.setAttribute("normal", new BufferAttribute(normals, 3));
    const mesh:Mesh = new Mesh(
      geometry,
      this.showMaterial
    );
    mesh.scale.y = 1.5;
    let top = mesh.clone();
    top.position.set(0, 2, 0);

    let leftTop = mesh.clone();
    leftTop.position.set(-1, 1, 0);
    leftTop.rotation.z = Math.PI / 2;

    let rightTop = mesh.clone();
    rightTop.position.set(1, 1, 0);
    rightTop.rotation.z = Math.PI / 2;

    let leftBottom = mesh.clone();
    leftBottom.position.set(-1, -1, 0);
    leftBottom.rotation.z = Math.PI / 2;

    let rightBottom = mesh.clone();
    rightBottom.position.set(1, -1, 0);
    rightBottom.rotation.z = Math.PI / 2;

    let bottom = mesh.clone();
    bottom.position.set(0, -2, 0);

    const group = new Group();

    this.childrenGroup = [ top, leftTop, rightTop, mesh, leftBottom, rightBottom, bottom ];
    group.add( top, leftTop, rightTop, mesh, leftBottom, rightBottom, bottom );

    this.group = group;
    return group;
  }

  createLightSetting() {
    let zero = [1, 1, 1, 0, 1, 1, 1];
    let one = [0, 0, 1, 0, 0, 1, 0];
    let two = [1, 0, 1, 1, 1, 0, 1];
    let three = [1, 0, 1, 1, 0, 1, 1];
    let four = [0, 1, 1, 1, 0, 1, 0];
    let five = [1, 1, 0, 1, 0, 1, 1];
    let six = [1, 1, 0, 1, 1, 1, 1];
    let seven = [1, 0, 1, 0, 0, 1, 0];
    let eight = [1, 1, 1, 1, 1, 1, 1];
    let nine = [1, 1, 1, 1, 0, 1, 1];

    let numberSetting = [
      zero,
      one,
      two,
      three,
      four,
      five,
      six,
      seven,
      eight,
      nine
    ];
    return numberSetting;
  }
  set number(value: number) {
    if (value < 0 || value > 9) {
      console.error(`number not in range`);
      return;
    }
    value = Math.floor(value);
    this._number = value;
    this.updateNumber(this._number);
  }

  get number() {
    return this._number;
  }
  updateNumber(n: number) {
    let info = this.lightSetting[n];
    if (info) {
      for (let i = 0; i < this.childrenGroup.length; i++) {
        if( this.childrenGroup[i] instanceof Mesh){
          if( this.childrenGroup[i].material instanceof MeshBasicMaterial ){
            this.childrenGroup[i].material = info[i] ? this.showMaterial : this.hideMaterial;
          }
        }
      }
    }
  }
}
