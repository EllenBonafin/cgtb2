import { Pivot, PivotItem } from '@fluentui/react';
import { useObjects } from 'components/Provider';
import ZBuffer from 'components/zBuffer';

import { PivotCamera } from 'interface/pivot_camera';
import { PivotObject } from 'interface/pivot_obj';
import { PivotLight } from 'interface/pivot_light';
import { PivotScene } from 'interface/pivot_scene';
import { CSSProperties, useEffect, useState } from 'react';

function App() {
  const p: CSSProperties = {
    padding: 8,
    maxHeight: '85vh',
    overflowY: 'auto',
  };
  const [selectedObject, setSelectedObject] = useState<string[]>([]);
  const [lastPosition, setLastPosition] = useState([0, 0, 0]);

  const { cameras, handleChangeCameras } = useObjects();

  useEffect(() => {
    const element = document.getElementById('canvaArea');
    const height = element?.clientHeight;
    const width = element?.clientWidth;

    const heightCanva = height ? height / 4 : 0;
    const widthCanva = width ? width / 4 : 0;

    const camerasLocal = cameras.map((camera) => {
      camera.setWindowSize(
        {
          height: [-heightCanva, heightCanva],
          width: [-widthCanva, widthCanva],
        },
        {
          height: [-heightCanva, heightCanva],
          width: [-widthCanva, widthCanva],
        }
      );
      return camera;
    });
    handleChangeCameras(camerasLocal);
  }, []);

  return (
    <div style={{ display: 'flex', height: '135vh' }}>
      <div style={{ width: '45vw', height: '100%', padding: 8 }}>
        <Pivot>
          <PivotItem headerText="Cena" style={p} itemKey="0">
            <PivotScene />
          </PivotItem>
          <PivotItem headerText="Objetos" style={p} itemKey="1">
            <PivotObject />
          </PivotItem>
          <PivotItem headerText="Câmera" style={p} itemKey="2">
            <PivotCamera />
          </PivotItem>
          <PivotItem headerText="Luz" style={p} itemKey="3">
            <PivotLight />
          </PivotItem>
        </Pivot>
      </div>
      <div
        className="canvaArea"
        id="canvaArea"
        style={{
        }}
      >
        <ZBuffer
          selectedObject={selectedObject}
          setSelectedObject={setSelectedObject}
          setLastPosition={setLastPosition}
          lastPosition={lastPosition}
        />
      </div>
      
    </div>
  );
}

export default App;
