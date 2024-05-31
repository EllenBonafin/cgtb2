import {
  IconButton,
  Modal,
  PrimaryButton,
  Stack,
  Text,
  TextField,
} from '@fluentui/react';
import { useObjects } from 'components/Provider';
import { FC, useState } from 'react';
import { arrayNumberToArrayString } from 'utils/others';

const gapStack = { childrenGap: 5 };

interface ModalObject {
  open: boolean;
  handleOpen: () => void;
  objectID: string;
}

export const ModalContent: FC<ModalObject> = ({
  open,
  handleOpen,
  objectID,
}) => {
  const { objects, handleChangeObject } = useObjects();
  const object = objects.find((obj) => obj.id === objectID);

  const [Ka, setKa] = useState(arrayNumberToArrayString(object?.Ka));
  const [Kd, setKd] = useState(arrayNumberToArrayString(object?.Kd));
  const [Ks, setKs] = useState(arrayNumberToArrayString(object?.Ks));
  const [Ns, setNs] = useState(object?.n.toString() ?? '1');

  const onCreate = () => {
    if (!object) return;

    object.setIlumination(
      [parseFloat(Ka[0]), parseFloat(Ka[1]), parseFloat(Ka[2])], // Ka
      [parseFloat(Kd[0]), parseFloat(Kd[1]), parseFloat(Kd[2])], // Kd
      [parseFloat(Ks[0]), parseFloat(Ks[1]), parseFloat(Ks[2])], // Ks
      parseFloat(Ns)
    );
    handleChangeObject(object);
    handleOpen();
  };
  return (
    <Modal isOpen={open} onDismiss={handleOpen}>
      <div style={{ padding: 8 }}>
        <Stack
          horizontal
          verticalAlign="center"
          horizontalAlign="space-between"
        >
          <h2>Opções da esfera</h2>
          <IconButton
            onClick={handleOpen}
            iconProps={{ iconName: 'Cancel' }}
          ></IconButton>
        </Stack>
        <Stack tokens={gapStack}>
          <Text variant="xLarge">Ka</Text>
          <Stack horizontal tokens={gapStack}>
            <TextField
              label="R"
              value={Ka[0]}
              onChange={(e) => setKa([e.currentTarget.value, Ka[1], Ka[2]])}
              min={0.0}
              max={1.0}
            />
            <TextField
              label="G"
              value={Ka[1]}
              onChange={(e) => setKa([Ka[0], e.currentTarget.value, Ka[2]])}
              min={0.0}
              max={1.0}
            />
            <TextField
              label="B"
              value={Ka[2]}
              onChange={(e) => setKa([Ka[0], Ka[1], e.currentTarget.value])}
              min={0.0}
              max={1.0}
            />
          </Stack>
          <Text variant="xLarge">Kd</Text>
          <Stack horizontal tokens={gapStack}>
            <TextField
              label="R"
              value={Kd[0]}
              onChange={(e) => setKd([e.currentTarget.value, Kd[1], Kd[2]])}
              min={0.0}
              max={1.0}
            />
            <TextField
              label="G"
              value={Kd[1]}
              onChange={(e) => setKd([Kd[0], e.currentTarget.value, Kd[2]])}
              min={0.0}
              max={1.0}
            />
            <TextField
              label="B"
              value={Kd[2]}
              onChange={(e) => setKd([Kd[0], Kd[1], e.currentTarget.value])}
              min={0.0}
              max={1.0}
            />
          </Stack>
          <Text variant="xLarge">Ks</Text>
          <Stack horizontal tokens={gapStack}>
            <TextField
              label="R"
              value={Ks[0]}
              onChange={(e) => setKs([e.currentTarget.value, Ks[1], Ks[2]])}
              min={0.0}
              max={1.0}
            />
            <TextField
              label="G"
              value={Ks[1]}
              onChange={(e) => setKs([Ks[0], e.currentTarget.value, Ks[2]])}
              min={0.0}
              max={1.0}
            />
            <TextField
              label="B"
              value={Ks[2]}
              onChange={(e) => setKs([Ks[0], Ks[1], e.currentTarget.value])}
              min={0.0}
              max={1.0}
            />
          </Stack>
          <TextField
            label="N"
            value={Ns}
            onChange={(e) => setNs(e.currentTarget.value)}
            type="number"
            min={0.0}
          />
        </Stack>
        <PrimaryButton onClick={onCreate}>Editar objeto</PrimaryButton>
      </div>
    </Modal>
  );
};
