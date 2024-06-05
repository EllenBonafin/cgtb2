import { createContext, useCallback, useContext, useState } from 'react';
import { Camera } from './Camera';

import { vec3 } from 'utils/interfaces';
import { Object } from './Object';
import { Light } from './Light';

interface ObjectsProviderInterface {
  objects: Object[];
  setObjects: React.Dispatch<React.SetStateAction<Object[]>>;
  cameras: Camera[];
  setCamera: React.Dispatch<React.SetStateAction<Camera[]>>;
  light: Light;
  setLight: React.Dispatch<React.SetStateAction<Light>>;
  /**Limpar a cena */
  handleClear: () => void;
  handleClearObjects: () => void;
  /**Remove o obj pelo ID
   * @param id ID do obj
   */
  handleRemoveObject: (id: string) => void;
  handleChangeObject: (object: Object | Object[]) => void;
  handleChangeCameras: (camera: Camera | Camera[]) => void;
  handleChangeLight: (light: Light) => void;
}
const ObjectsProviderInitial = {} as ObjectsProviderInterface;
const ObjectsP = createContext<ObjectsProviderInterface>(
  ObjectsProviderInitial
);

export function useObjects() {
  return useContext(ObjectsP);
}

interface Props {
  children: React.ReactNode;
}

//Valores iniciais da câmera
const defaultVRP: vec3 = [0, 0, 100];
const defaultP: vec3 = [0, 0, 0];
const defaultFar: number = 10000;
const defaultNear: number = 20;
const defaultLookUp: vec3 = [0, 1, 0];

//Valores iniciais da luz
const defaultAmbientIntensity: vec3 = [50, 50, 50];
const defaultLightIntensity: vec3 = [120, 120, 120];
const defaultPositionLight: vec3 = [300, 0, 0];

export function ObjectsProvider({ children }: Props) {
  //Inicia uma esfera
  const [objects, setObjects] = useState<Object[]>([new Object([1, 0, 0], 20,  'CUBO'), new Object([20, 0, 0], 20,  'TRI')]);

  //Inicia a câmera
  const [cameras, setCamera] = useState<Camera[]>([
    new Camera(
      defaultVRP,
      defaultP,
      { width: [-600, 600], height: [-600, 600] },
      { width: [-600, 600], height: [-600, 600] },
      defaultFar,
      defaultNear,
      defaultLookUp,
      1,
      'perspectiva',
      false
    ),
    new Camera(
      undefined,
      undefined,
      { width: [-300, 300], height: [-300, 300] },
      { width: [-300, 600], height: [-300, 600] },
      defaultFar,
      defaultNear,
      undefined,
      undefined,
      'paralela',
      false
    ),
    new Camera(
      undefined,
      undefined,
      { width: [-300, 300], height: [-300, 300] },
      { width: [-300, 300], height: [-300, 300] },
      defaultFar,
      defaultNear,
      undefined,
      undefined,
      'paralela',
      false
    ),
    new Camera(
      undefined,
      undefined,
      { width: [-300, 300], height: [-300, 300] },
      { width: [-300, 300], height: [-300, 300] },
      defaultFar,
      defaultNear,
      undefined,
      undefined,
      'paralela',
      false
    ),

  ]);

  //Inicia a luz
  const [light, setLight] = useState<Light>(
    new Light(
      defaultPositionLight,
      defaultAmbientIntensity,
      defaultLightIntensity
    )
  );

  //Limpa os objetos
  const handleClearObjects = () => {
    setObjects([]);
  };

  //Limpa a cena e reseta alguns valores
  const handleClear = () => {
    handleClearObjects();

    light.setIntensity(defaultAmbientIntensity, defaultLightIntensity);
    light.setPosition(defaultPositionLight);
  };

  //Remove uma objeto pelo ID
  const handleRemoveObject = (id: string) => {
    setObjects((prevState) => prevState.filter((object) => object.id !== id));
  };

  const handleChangeObject = useCallback(
    (object: Object | Object[]) => {
      let newObjects = [...objects];
      if (Array.isArray(object)) {
        object.forEach((obj) => {
          const index = objects.findIndex((object) => object.id === obj.id);
          newObjects[index] = obj;
        });
      } else {
        const index = objects.findIndex((object) => object.id === object.id);
        newObjects[index] = object;
      }
      setObjects(newObjects);
    },
    [objects]
  );

  const handleChangeCameras = useCallback(
    (camera: Camera | Camera[]) => {
      let newCameras = [...cameras];
      if (Array.isArray(camera)) {
        camera.forEach((obj) => {
          const index = cameras.findIndex(
            (object) => object.typeCamera === obj.typeCamera
          );
          newCameras[index] = obj;
        });
      } else {
        const index = cameras.findIndex(
          (object) => object.typeCamera === camera.typeCamera
        );
        newCameras[index] = camera;
      }
      setCamera(newCameras);
    },
    [cameras]
  );

  const handleChangeLight = useCallback(
    (newLight: Light) => {
      const lightLocal = new Light(
        newLight.position,
        newLight.ambientLightIntensity,
        newLight.lightIntensity,
        newLight.lightType
      );
      setLight(lightLocal);
    },
    [light]
  );

  const values = {
    objects,
    setObjects,
    cameras,
    light,
    setLight,
    handleClear,
    handleClearObjects,
    setCamera,
    handleRemoveObject,
    handleChangeObject,
    handleChangeCameras,
    handleChangeLight,
  };
  return <ObjectsP.Provider value={values}>{children}</ObjectsP.Provider>;
}
