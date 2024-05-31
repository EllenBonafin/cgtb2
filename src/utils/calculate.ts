import nj from '@d4c/numjs';
import { vec3, vec4 } from './interfaces';

type MatrixN = number[][];

export function translate(
  matrix: vec3[] | vec3 | vec4,
  dx: number,
  dy: number,
  dz: number
): vec3[] | vec3 | vec4 {
  const matrixCalc: MatrixN = [
    [1, 0, 0, dx],
    [0, 1, 0, dy],
    [0, 0, 1, dz],
    [0, 0, 0, 1],
  ];

  //Verifica se é todas as posições ou apenas uma
  if (matrix[0].constructor !== Array) {
    return matrixMul(matrix as vec3 | vec4, matrixCalc);
  } else
    return matrix.map((vec3) => {
      return matrixMul(vec3 as vec3, matrixCalc);
    }) as vec3[];
}

export function rotate(
  matrix: vec3[] | vec3 | vec4,
  ang: number,
  option: 'X' | 'Y' | 'Z'
): vec3[] | vec3 | vec4 {
  let rotO: number[][];
  //Transforma o angulo
  ang = toDegrees(ang);


  if (option === 'X') {
    rotO = [
      [1, 0, 0, 0],
      [0, Math.cos(ang), -Math.sin(ang), 0],
      [0, Math.sin(ang), Math.cos(ang), 0],
      [0, 0, 0, 1],
    ];
  } else if (option === 'Y') {
    rotO = [
      [Math.cos(ang), 0, Math.sin(ang), 0],
      [0, 1, 0, 0],
      [-Math.sin(ang), 0, Math.cos(ang), 0],
      [0, 0, 0, 1],
    ];
  } else if (option === 'Z') {
    rotO = [
      [Math.cos(ang), -Math.sin(ang), 0, 0],
      [Math.sin(ang), Math.cos(ang), 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
  } else {
    return matrix;
  }

  if (matrix[0].constructor !== Array) {
    return matrixMul(matrix as vec3 | vec4, rotO);
  } else {
    return matrix.map((vec3) => {
      return matrixMul(vec3 as vec3, rotO);
    }) as vec3[];
  }
}

export function scale(
  matrix: vec3[] | vec3 | vec4,
  sX: number,
  sY: number,
  sZ: number
): vec3[] | vec3 | vec4 {
  const matrixCalc = [
    [sX, 0, 0, 0],
    [0, sY, 0, 0],
    [0, 0, sZ, 0],
    [0, 0, 0, 1],
  ];


  if (matrix[0].constructor !== Array) {
    return matrixMul(matrix as vec3 | vec4, matrixCalc);
  } else {
    //Caso seja uma matriz, multiplica cada posição
    return matrix.map((vec3) => {
      return matrixMul(vec3 as vec3, matrixCalc);
    }) as vec3[];
  }
}


export function matrixMul(
  vec3: vec3 | vec4,
  matrixCalc: number[][]
): vec3 | vec3[] | vec4 {
  
  if (vec3.length === 3) vec3.push(1);


  const result = nj.dot(nj.array(matrixCalc), nj.array(vec3));

  if (vec3.length > 3) return result.tolist() as vec3;

  else
    return (
      result
        .tolist()
        .slice(0, 3) as vec3[] | vec3
    );
}

export function transpose(matrix: vec3[]): vec3[] {
  return nj.array(matrix).transpose().tolist() as vec3[];
}

export function toDegrees(angle: number) {
  return angle * (Math.PI / 180);
}
