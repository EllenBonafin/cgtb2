import {
  ChoiceGroup,
  DefaultButton,
  Dropdown,
  IconButton,
  IDropdownOption,
  Slider,
  Stack,
  Text,
} from '@fluentui/react';
import { Object } from 'components/Object';
import { useObjects } from 'components/Provider';
import { FC, useEffect, useState } from 'react';
import { ModalContent } from './Modal_Modal';

const gapStack = { childrenGap: 5 };

export const PivotObject: FC = ({}) => {
  const { objects, handleRemoveObject, handleChangeObject } = useObjects();

  const options = [
    {
      key: 'rotate',
      text: 'Rotacionar',
    },
    { key: 'scale', text: 'Escalar' },
    { key: 'translate', text: 'Transladar' },
  ];
  const [option, setOption] = useState('rotate');

  const [selectedObject, setSelectedObject] = useState('');

  const [optionsSphere, setOptionsSphere] = useState<IDropdownOption[]>([]);
  //Define as objetos selecionáveis
  useEffect(() => {
    if (objects.length === 0) return;
    const temp = objects.map((obj) => {
      return {
        key: obj.id,
        text: obj.OBJCT,
      };
    }) as IDropdownOption[];
    temp.push({ key: 'all', text: 'Todas as objetos' });
    temp.push({ key: 'clean', text: 'Limpar' });
    setOptionsSphere(temp);
  }, [objects]);

  const optionsRotation = [
    { key: 'X', text: 'X' },
    { key: 'Y', text: 'Y' },
    { key: 'Z', text: 'Z' },
  ];
  const [optionRotation, setOptionRotation] = useState('X');

  const [valueX, setValueX] = useState(0);
  const [valueY, setValueY] = useState(0);
  const [valueZ, setValueZ] = useState(0);

  const [angle, setAngle] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const handleOpen = () => setModalOpen(!modalOpen);

  const handleChange = () => {
    if (option === '' || selectedObject === '') return;

    //Vai selecionar o objeto que está sendo manipulado
    const selectedObjects =
      selectedObject === 'all'
        ? objects
        : [objects.find((obj: Object) => obj.id === selectedObject)];
    if (!selectedObjects.length) return;

    switch (option) {
      case 'rotate':
        selectedObjects.forEach((object) =>
          object?.rotate(angle, optionRotation as 'X' | 'Y' | 'Z')
        );
        break;
      case 'scale':
        selectedObjects.forEach((object) =>
          object?.scale(Number(valueX), Number(valueY), Number(valueZ))
        );
        break;
      case 'translate':
        selectedObjects.forEach((object) =>
          object?.translate(Number(valueX), -Number(valueY), Number(valueZ))
        );

        break;
    }

    handleChangeObject(selectedObjects as Object[]);

    //Redifine todas opções
    setAngle(0);
    setValueX(0);
    setValueY(0);
    setValueZ(0);
    setOptionRotation('X');
    setOption('rotate');
  };

  const handleChageDropdown = (
    e: React.FormEvent<HTMLDivElement>,
    option?: any
  ) => {
    if (!option) return;
    if (option!.key === 'clean') setSelectedObject('');
    else setSelectedObject(option!.key as string);
  };

  const handleRemoveSphereOption = () => {
    if (selectedObject === '') return;
    if (selectedObject === 'all') {
      objects.forEach((obj) => handleRemoveObject(obj.id));
    } else handleRemoveObject(selectedObject);
    setSelectedObject('');
  };

  return (
    <Stack tokens={gapStack}>
      <Text variant="xLarge">Editar objeto</Text>
      <Stack horizontal verticalAlign="end">
        <Dropdown
          label="Selecione uma objeto"
          options={optionsSphere}
          selectedKey={selectedObject}
          //Função que define o valor selecionado
          onChange={handleChageDropdown}
          disabled={objects.length === 0}
        />
        <IconButton
          split
          title="Deletar objeto"
          iconProps={{ iconName: 'Delete' }}
          disabled={selectedObject === ''}
          onClick={handleRemoveSphereOption}
        />
        <IconButton
          split
          title="Editar objeto"
          iconProps={{ iconName: 'Edit' }}
          disabled={selectedObject === '' || selectedObject === 'all'}
          onClick={handleOpen}
        />
      </Stack>
      {selectedObject !== '' ? (
        <>
          <ChoiceGroup
            label="Selecione a opção desejada"
            options={options}
            selectedKey={option}
            onChange={(e, v) => {
              setOption(v!.key);
              if (v!.key === 'scale') {
                setValueX(1);
                setValueY(1);
                setValueZ(1);
              }
            }}
            required
          />
          {option === 'rotate' ? (
            <Stack>
              <Slider
                label="Angulo"
                min={0}
                max={360}
                value={angle}
                onChange={(v) => setAngle(v)}
              />
              <ChoiceGroup
                label="Selecione o eixo da rotação"
                options={optionsRotation}
                selectedKey={optionRotation}
                onChange={(e, v) => setOptionRotation(v!.key)}
              />
            </Stack>
          ) : (
            <Stack tokens={gapStack}>
              <Slider
                label="Valor X"
                min={option === 'scale' ? -10 : -1000}
                step={option === 'scale' ? 0.1 : 1}
                max={option === 'scale' ? 10 : 1000}
                value={valueX}
                onChange={(v) => setValueX(v)}
                showValue
              />
              <Slider
                label="Valor Y"
                min={option === 'scale' ? -10 : -1000}
                step={option === 'scale' ? 0.1 : 1}
                // max={10}
                max={option === 'scale' ? 10 : 1000}
                value={valueY}
                onChange={(v) => setValueY(v)}
                showValue
              />
              <Slider
                label="Valor Z"
                min={option === 'scale' ? -10 : -1000}
                max={option === 'scale' ? 10 : 1000}
                step={option === 'scale' ? 0.1 : 1}
                value={valueZ}
                onChange={(v) => setValueZ(v)}
                showValue
              />
            </Stack>
          )}
          <DefaultButton text="Aplicar" onClick={handleChange} />
        </>
      ) : null}
      {modalOpen ? (
        <ModalContent
          handleOpen={handleOpen}
          open={modalOpen}
          objectID={selectedObject}
        />
      ) : null}
    </Stack>
  );
};
