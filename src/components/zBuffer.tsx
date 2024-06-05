import p5Types from 'p5';
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { matrixMul } from 'utils/calculate';
import { vec3, vec4 } from 'utils/interfaces';
import { Object } from './Object';
import { useObjects } from './Provider';
interface Props {
  selectedObject: string[];
  setSelectedObject: Dispatch<SetStateAction<string[]>>;
  lastPosition: number[];
  setLastPosition: Dispatch<SetStateAction<number[]>>;
}

const ZBuffer: FC<Props> = ({
  selectedObject,
  setSelectedObject,
  lastPosition,
  setLastPosition,
}) => {
  const { objects, cameras, light, handleChangeLight } = useObjects();

  const canvas = useRef<HTMLCanvasElement>();

  const camera = cameras[0];

  //Calcula as dimensões do viewport da câmera
  const width =
    Math.abs(camera.ViewPort.width[0]) + Math.abs(camera.ViewPort.width[1]); 
  const height =
    Math.abs(camera.ViewPort.height[0]) + Math.abs(camera.ViewPort.height[1]);//

  const zBuffer = useMemo(
    () =>
      new Array(width).fill(null).map(() => new Array(height).fill([0, 0, 0])),//armazenar as cores dos pixels visíveis
    [width, height]
  );
  const zDepth = useMemo(
    () => new Array(width).fill(Infinity).map(() => new Array(height)),//para armazenar a profundidade dos pixels visíveis
    [width, height]
  );

  let fillPolygons = 1;

  const isFlatShading = light.lightType === 0;
  const p5 = p5Types.Vector;
  function fillPolygon(
    vertices: vec3[],
    selected: boolean = false,
    object: Object,
    indexFace: number
  ) {
    const minY = Math.min(...vertices.map(([_, y]) => y)); //limites do poligno
    const maxY = Math.max(...vertices.map(([_, y]) => y));

    const L = new p5(...light.position)
      .sub(new p5(...object.facesCentroid[indexFace]))
      .normalize();
    const S = new p5(...camera.VRP)
      .sub(new p5(...object.facesCentroid[indexFace]))
      .normalize();

    const H = L.add(S).normalize();


    for (let y = minY; y <= maxY; y++) { //min y e max y horizontalmente scanline
      const intersections: { x: number; z: number }[] = []; 

      for (let i = 0; i < vertices.length; i++) {
        const [x1, y1, z1] = vertices[i];
        const [x2, y2, z2] = vertices[(i + 1) % vertices.length];//liga o último ponto de volta ao primeiro ponto, fechando o polígono.

        if ((y1 <= y && y2 > y) || (y1 > y && y2 <= y)) { //verifica se o y esta entre o y1 e y2 ou y2 e y1
          const t = (y - y1) / (y2 - y1); // interpolacao t diz onde y está, y está entre y1 e y2.
          const x = Math.round(x1 + t * (x2 - x1)); //encontrar a coordenada x 

          const z = z1 + t * (z2 - z1); //coordenada z 
          intersections.push({ x: Math.round(x), z });
        }
      }

      intersections.sort((a, b) => a.x - b.x); //ordenando da esq p direita

      for (let i = 0; i < intersections.length; i += 2) { //for em pares inicio e fim 
        const start = intersections[i]; //inicio 
        const end = intersections[i + 1]; //fim da linha de preenchimento y

        if (!start || !end) continue;
        for (let x = start.x; x <= end.x; x++) { // aqui inicia a preencher os pixels do min ate o max da linha 
          if (x >= width || y >= height || x < 0 || y < 0) break; //verfic o canva
          const t = (x - start.x) / (end.x - start.x);

          //Calcula a distância do Z em relação a camera
          const z = start.z + t;
          const distanceZ = (z - camera.near) / (camera.far - camera.near);

          if (zDepth[x][y] > distanceZ) {
            if (selected) {
              zBuffer[x][y] = [200, 0, 0]; // o novo ponto é mais próximo da câmera.
            } else {
              isFlatShading
                ? (zBuffer[x][y] = object.calculateFlatShading(
                    light,
                    camera,
                    indexFace
                  ))
                : (zBuffer[x][y] = object.calculatePhongShading(
                    light,

                    [x, y, z],
                    H,
                    L
                  ));
                  //calculatePhongShading é chamada para calcular a cor do pixel com base em sua posição 
                  //([x, y, z]), na direção da luz (L), e na metade do caminho entre a direção da luz e a direção do observador (H).
            }

            zDepth[x][y] = distanceZ;
          }
        }
      }
    }
  }
  function drawLines(vertices: vec3[], selected: boolean = false) {
    let firstHole = vertices[0];
    for (let i = 1; i < vertices.length - 1; i++) {
      const [x1, y1, z1] = vertices[i];
      const [x2, y2, z2] = vertices[i + 1];

      if (x1 === firstHole[0] && y1 === firstHole[1] && z1 === firstHole[2]) {
        firstHole = vertices[i + 1];
        i++;
        continue;
      }

      const dx = x2 - x1;
      const dy = y2 - y1;
      const dz = z2 - z1;

      const steps = Math.max(Math.abs(dx), Math.abs(dy));

      const xIncrement = dx / steps;
      const yIncrement = dy / steps;
      const zIncrement = dz / steps;

      let x = x1;
      let y = y1;
      let z = z1;

      for (let i = 0; i <= steps; i++) {
        if (x >= width || y >= height || x < 0 || y < 0) break;

        let roundedX = Math.round(x);
        let roundedY = Math.round(y);

        if (zDepth[roundedX][roundedY] > z) {
          if (selected) {
            zBuffer[roundedX][roundedY] = [200, 0, 0];
          } else {
            zBuffer[roundedX][roundedY] = [255, 255, 255];
          }

          zDepth[roundedX][roundedY] = z;
        }

        x += xIncrement;
        y += yIncrement;
        z += zIncrement;
      }
    }
  }

  const draw2D = () => {
    if (!canvas.current) return;

    const ctx = canvas.current.getContext('2d', {});
    ctx?.fillRect(0, 0, width, height);
    zBuffer.forEach((line) => line.fill([0, 0, 0]));
    zDepth.forEach((line) => line.fill(Infinity));
    const imageData = ctx?.getImageData(0, 0, width, height);
    const data = imageData?.data;

    objects.sort((a, b) => {
      return a.center[2] - b.center[2];
    });

    if (data) {
      objects.forEach((object) => {
        for (let i = 0; i < object.faces.length; i++) {
          if (!object.isFaceVisible(camera, i)) continue;
          const face = object.faces[i].map((vertex) => {
            const vertexSRT = matrixMul(vertex, camera.concatedMatrix) as vec4;
            const x = Math.round(vertexSRT[0] - camera.ViewPort.width[0]);
            const y = Math.round(vertexSRT[1] - camera.ViewPort.height[0]);
            return [x, y, vertex[2]] as vec3;
          })

          if (fillPolygons) fillPolygon(face, false, object, i);
          else drawLines(face, selectedObject.includes(object.id));
        }
      });

      for (let i = 0; i < zBuffer.length; i++) {
        for (let j = 0; j < zBuffer[0].length; j++) {
          const index = (j * width + i) * 4;
          const [R, G, B] = zBuffer[i][j];
          data[index] = R;
          data[index + 1] = G;
          data[index + 2] = B;
        }
      }
      data.set(data);

      ctx?.putImageData(imageData, 0, 0);
    }
  };

  useEffect(() => {
    setTimeout(draw2D, 0);
  }, [
    canvas,
    cameras,
    objects,
    selectedObject,
    lastPosition,
    light,
    handleChangeLight,
  ]);

  const Canvas = useMemo(
    () => (
      <canvas
        ref={canvas as any}
        width={1000}
        height={1000}
      />
    ),
    [
      cameras,
      objects,
      selectedObject,
      lastPosition,
      light,
      canvas,
      width,
      height,
      handleChangeLight,
    ]
  );
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1,
          color: 'white',
          userSelect: 'none',
        }}
      >
        {camera.typeCamera}
      </span>
      {Canvas}
    </div>
  );
};

export default ZBuffer;
