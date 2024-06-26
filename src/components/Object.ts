import p5Types from 'p5';
import { matrixMul, rotate, scale, translate } from 'utils/calculate';
import OBJ from 'utils/objects';
import { OBJCT, vec3 } from 'utils/interfaces';
import { amplifierEdges, getCentroidFaces, getNormal } from 'utils/others';
import { Camera } from './Camera';
import { Light } from './Light';
export class Object {
  public faces: vec3[][] = [];

  private facesNormal: vec3[] = [];

  public facesCentroid: vec3[] = [];

  edges: [[vec3]] = [[[-1, -1, -1]]];

  public center: vec3 = [0, 0, 0];

  private ZDepth: number = 0;

  readonly id: string;

  readonly OBJCT: OBJCT = 'CUBO';

  Ka: vec3; //Fator de Reflexão Ambiente
  Kd: vec3; //Fator de Reflexão Difusa
  Ks: vec3; //Fator de Reflexão Especular
  n: number; //BRILHO

  constructor(
    center: vec3,
    ZDepth: number,
    OBJCT: OBJCT,
    Ka: vec3 = [0.1, 0.5, 0.1],
    Kd: vec3 = [0.1, 0.5, 0.1],
    Ks: vec3 = [0.1, 0.1, 0.1],
    n: number = 1,
    faces?: vec3[][]
  ) {
    this.center = center;
    this.ZDepth = ZDepth;

    this.OBJCT = OBJCT;

    this.id = self.crypto.randomUUID();

    if (faces) {
      this.faces = faces;
      this.calculateFacesNormal();
      this.findFacesCentroid();
    } else this.findFaces();

    this.Ka = Ka;
    this.Kd = Kd;
    this.Ks = Ks;

    this.n = n;
  }

  private findFaces() {
    // Calcula o valor de Z, metade da profundidade do objeto
    const Z = this.ZDepth / 2;
    // Define o deslocamento como o centro do objeto
    const displacement = this.center;
  
    // Obtém os bordos do objeto
    const edges = OBJ[this.OBJCT] as vec3[][];
  
    // Arrays para armazenar as faces nos planos Z e -Z, e as conexões entre eles
    const facesZ: vec3[] = [];
    const facesConnections: vec3[][] = [];
    const facesZDepth: vec3[] = [];
  
    // Itera sobre cada bordo do objeto
    for (let edge of edges) {
      const length = edge.length;
      // Calcula o primeiro ponto da face no plano Z
      const firstPoint = amplifierEdges([
        edge[0][0] + displacement[0],
        edge[0][1] + displacement[1],
        Z,
      ]);
  
      // Adiciona o primeiro ponto à lista de faces no plano Z
      facesZ.push([firstPoint[0], firstPoint[1], Z + displacement[2]]);
  
      // Itera reversamente sobre os pontos do bordo para calcular as faces no plano Z
      for (let j = length - 1; j >= 0; j--) {
        const [x, y] = amplifierEdges([
          edge[j][0] + displacement[0],
          edge[j][1] + displacement[1],
          Z,
        ]);
        // Adiciona os pontos à lista de faces no plano Z
        facesZ.push([x, y, Z + displacement[2]]);
      }
  
      // Itera sobre os pontos do bordo para calcular as faces no plano -Z
      for (let j = 0; j < length; j++) {
        const [x, y] = amplifierEdges([
          edge[j][0] + displacement[0],
          edge[j][1] + displacement[1],
          -Z,
        ]);
        // Adiciona os pontos à lista de faces no plano -Z
        facesZDepth.push([x, y, -Z + displacement[2]]);
      }
      // Adiciona o primeiro ponto novamente à lista de faces no plano -Z
      facesZDepth.push([firstPoint[0], firstPoint[1], -Z + displacement[2]]);
    }
  
    // Itera sobre os furos do objeto
    for (let hole of edges) {
      for (let j = 0; j < hole.length; j++) {
        const [x, y] = amplifierEdges([
          hole[j][0] + displacement[0],
          hole[j][1] + displacement[1],
          Z,
        ]);
        const index = (j + 1) % hole.length;
        const [xNextFace, yNextFace] = amplifierEdges([
          hole[index][0] + displacement[0],
          hole[index][1] + displacement[1],
          Z,
        ]);
  
        // Verifica a ordem dos pontos e adiciona as conexões entre eles
        if (x <= xNextFace) {
          facesConnections.push([
            [x, y, -Z + displacement[2]],
            [x, y, Z + displacement[2]],
            [xNextFace, yNextFace, Z + displacement[2]],
            [xNextFace, yNextFace, -Z + displacement[2]],
            [x, y, -Z + displacement[2]],
          ]);
        } else {
          facesConnections.push([
            [xNextFace, yNextFace, Z + displacement[2]],
            [xNextFace, yNextFace, -Z + displacement[2]],
            [x, y, -Z + displacement[2]],
            [x, y, Z + displacement[2]],
            [xNextFace, yNextFace, Z + displacement[2]],
          ]);
        }
      }
    }
  
    // Atualiza as faces do objeto com as faces calculadas e calcula as normais e centroides
    this.faces = [facesZ, facesZDepth, ...facesConnections];
    this.calculateFacesNormal();
    this.findFacesCentroid();
  }
  

  calculateFacesNormal() {
    const facesNormal: vec3[] = [];

    for (let face of this.faces) {
      const normal = getNormal(face);
      facesNormal.push(normal.array() as vec3);
    }

    this.facesNormal = facesNormal;
  }

  private findFacesCentroid() {
    this.facesCentroid = this.faces.map((face) => getCentroidFaces(face));
  }

  public setIlumination(Ka?: vec3, Kd?: vec3, Ks?: vec3, n?: number) {
    if (Ka) this.Ka = Ka;
    if (Kd) this.Kd = Kd;
    if (Ks) this.Ks = Ks;
    if (n) this.n = n;
  }

  isFaceVisible(camera: Camera, indexFace: number): boolean {
    const p5 = p5Types.Vector;
    const VRP = new p5(...camera.VRP);
    const distance = new p5(...camera.N).dot(
      VRP.sub(new p5(...this.facesCentroid[indexFace]))
    );

    if (distance < camera.near || distance > camera.far) return false;

    if (!camera.ocultFaces) return true;

    // const OVector = VRP.sub(...camera.P).normalize();
    const OVector = VRP.sub(
      new p5(...this.facesCentroid[indexFace])
    ).normalize();
    const faceNormal = new p5(...this.facesNormal[indexFace]);
    const dot = OVector.dot(faceNormal);

    //Caso a face esteja na frente da camera, ela será desenhada
    return dot > 0.00000000001;
  }

  public calculateFlatShading(light: Light, camera: Camera, indexFace: number) {
    const p5 = p5Types.Vector;
    const centroid = new p5(...this.facesCentroid[indexFace]);
    const N = new p5(...this.facesNormal[indexFace]);

    const Ia = new p5(...light.ambientLightIntensity).mult(new p5(...this.Ka)); // Ia = La* Ka

    const L = new p5(...light.position).sub(centroid).normalize(); // l = L - cent
    const dotNL = N.dot(L); // produto escalar N e L 
    if (dotNL < 0) return Ia.array();

    const Id = new p5(...light.lightIntensity)
      .mult(new p5(...this.Kd))
      .mult(dotNL);

    const S = new p5(...camera.VRP).sub(centroid).normalize(); // s = vrp - cent -> ||
    const R = N.mult(2 * dotNL) //R=L−2(N⋅L)N
      .sub(L)
      .normalize();
    const dotRS = R.dot(S);
    if (dotRS < 0) return Ia.add(Id).array();

    const Is = new p5(...light.lightIntensity)
      .mult(new p5(...this.Ks))
      .mult(Math.pow(dotRS, this.n));
    return Ia.add(Id).add(Is).array();
  }
  //Translada a objeto
  translate(tX: number, tY: number, tZ: number) {
    //Move o centro
    this.center = translate(this.center, tX, tY, tZ) as vec3;
    //Move os vértices
    this.faces = this.faces.map((vec3) =>
      translate(vec3, tX, tY, tZ)
    ) as vec3[][];

    this.findFacesCentroid();
  }

  public calculatePhongShading(
    light: Light,
    vertex: vec3,
    H: p5Types.Vector,
    L: p5Types.Vector
  ) {
    const p5 = p5Types.Vector;
    const vertexPoint = new p5(vertex[0], vertex[1], vertex[2]);
    const N = vertexPoint.normalize();

    //Iluminação Ambiente
    const Ia = new p5(...light.ambientLightIntensity).mult(new p5(...this.Ka)); //intensidade*coeficiente de refelxao Ambiente

    const dotNL = N.dot(L);
    if (dotNL < 0) return Ia.array();

    const Id = new p5(...light.lightIntensity)
      .mult(new p5(...this.Kd)) //instisade * cofRefelxaoDifusa
      .mult(dotNL); //produto escalar NXL

    const dotNH = N.dot(H);
    if (dotNH < 0) return Ia.add(Id).array();

    //Iluminação Especular
    const Is = new p5(...light.lightIntensity)
      .mult(new p5(...this.Ks)) //instisade * cofRefelxaoEspecular
      .mult(Math.pow(dotNH, this.n));

    return Ia.add(Id).add(Is).array(); //Iluminacao Total
  }

  //Rotaciona a objeto
  rotate(angle: number, option: 'X' | 'Y' | 'Z') {
    const [x, y, z] = this.center;
    //Translada o centro para o centro da objeto
    let NCenter = translate(this.center, -x, -y, -z) as vec3;
    //Translada os pontos para o centro da objeto
    let NFaces = this.faces.map((vec3) =>
      translate(vec3, -x, -y, -z)
    ) as vec3[][];

    //Rotaciona os pontos
    NFaces = NFaces.map((vec3) => rotate(vec3, angle, option)) as vec3[][];
    //Rotaciona o centro
    NCenter = rotate(NCenter, angle, option) as vec3;

    //Devolve ao centro da objeto
    this.center = translate(NCenter, x, y, z) as vec3;
    //Devolve os pontos da objeto
    this.faces = NFaces.map((vec3) => translate(vec3, x, y, z)) as vec3[][];

    this.calculateFacesNormal();
    this.findFacesCentroid();
  }

  //Escala a objeto
  scale(sX: number, sY: number, sZ: number) {
    const [x, y, z] = this.center;

    let Ncenter = translate(this.center, -x, -y, -z) as vec3;
    let NFaces = this.faces.map((vec3) =>
      translate(vec3, -x, -y, -z)
    ) as vec3[][];

    //Escala o centro
    Ncenter = scale(Ncenter, sX, sY, sZ) as vec3;
    //Escala os vértices
    NFaces = NFaces.map((vec3) => scale(vec3, sX, sY, sZ)) as vec3[][];

    //Move o centro
    this.center = translate(Ncenter, x, y, z) as vec3;
    //Translada os vértices para o centro
    this.faces = NFaces.map((vec3) => translate(vec3, x, y, z)) as vec3[][];

    this.findFacesCentroid();
  }
}
