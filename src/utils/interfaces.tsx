export interface Port {
  width: [number, number];
  height: [number, number];
}
export type vec3 = [number, number, number];

export type vec4 = [number, number, number, number];

export type ObjectType = {
  center: vec3;
  ZDepth: number;
  OBJCT: OBJCT;
  Ka: vec3;
  Kd: vec3;
  Ks: vec3;
  n: number;
  faces: vec3[][];
};

export type OBJCT ='CUBO'
