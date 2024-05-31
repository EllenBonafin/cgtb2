import {
  DefaultButton,
  PrimaryButton,
  Slider,
  Stack,
  Text,
  TextField,
  VerticalDivider,
} from '@fluentui/react';
import { Camera } from 'components/Camera';
import { Object } from 'components/Object';
import { Light } from 'components/Light';
import { useObjects } from 'components/Provider';
import { useRef, useState } from 'react';

const gapStack = { childrenGap: 5 };

export const PivotScene = () => {
  const {
    handleClear,
    handleClearObjects,
    setObjects,
    objects,
    cameras,
    light,
    setLight,
    setCamera,
    handleChangeObject,
  } = useObjects();
  const ref = useRef<HTMLInputElement>(null);

  const [ZDepth, setZDepth] = useState(100);
  const handleOpenScene = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    } else if (file.type !== 'application/json') {
      alert('O arquivo deve ser do tipo JSON.');
      return;
    }

    try {
      const fileContent = await file.text();
      const parsedScene = JSON.parse(fileContent);

      // Verifique se o arquivo JSON possui a estrutura correta
      if (
        !parsedScene ||
        !Array.isArray(parsedScene.objects) ||
        !parsedScene.cameras ||
        !parsedScene.light
      ) {
        alert('Arquivo JSON inválido. Verifique a estrutura do arquivo.');
        return;
      }

      const camerasLocal: Camera[] = [];
      for (let camera of parsedScene.cameras) {
        camerasLocal.push(
          new Camera(
            camera.VRP,
            camera.P,
            camera.ViewPort,
            camera.WindowPort,
            camera.far,
            camera.near,
            camera.viewUp,
            camera.projectionPlanDistance,
            camera.typeCamera
          )
        );
      }
      setCamera(camerasLocal);

      const lightLocal = new Light(
        parsedScene.light.position.slice(0, 3),
        parsedScene.light.ambientLightIntensity,
        parsedScene.light.lightIntensity
      );
      setLight(lightLocal);

      const objectsLocal: Object[] = [];
      for (let object of parsedScene.objects) {
        const newObject = new Object(
          object.center,
          object.zDepth,
          object.OBJCT,
          object.Ka,
          object.Kd,
          object.Ks,
          object.n,
          object.faces
        );
        objectsLocal.push(newObject);
      }

      setObjects(objectsLocal);
    } catch (error) {
      console.error('Erro ao ler o arquivo JSON:', error);
      alert(
        'Ocorreu um erro ao ler o arquivo JSON. Verifique o console para mais detalhes.'
      );
    }
    e.target.value = '';
  };

  const downloadScene = () => {
    const scene = JSON.stringify({ objects, light, cameras });

    const element = document.createElement('a');
    const file = new Blob([scene], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'scene.json';
    document.body.appendChild(element); 
    element.click();
  };

  return (
    <Stack
      tokens={gapStack}
      style={{
        height: '100%',
      }}
    >
      <VerticalDivider />
      <DefaultButton
        text="Deletar objetos"
        onClick={handleClearObjects}
        iconProps={{ iconName: 'Delete' }}
      />
      <DefaultButton
        text="Limpar cena"
        onClick={handleClear}
        iconProps={{ iconName: 'ClearFormatting' }}
      />
      <DefaultButton
        text="Recarregar cena"
        onClick={() => {
          handleChangeObject(objects);
        }}
        iconProps={{ iconName: 'Refresh' }}
      />

      <VerticalDivider />
      <Text variant="xLarge">Arquivos</Text>
      <Stack
        style={{
          height: '100%',
          justifyContent: 'space-between',
        }}
        tokens={{
          childrenGap: 5,
        }}
        horizontal
      >
        <DefaultButton
          text="Salvar cena"
          onClick={downloadScene}
          iconProps={{ iconName: 'Save' }}
        />
        <DefaultButton
          text="Carregar cena"
          iconProps={{ iconName: 'OpenFile' }}
          onClick={() => {
            ref.current?.click();
          }}
        >
          <input
            type="file"
            accept="application/json"
            onChange={handleOpenScene}
            id="file"
            ref={ref}
            style={{
              display: 'none',
            }}
          />
        </DefaultButton>
      </Stack>
    </Stack>
  );
};
