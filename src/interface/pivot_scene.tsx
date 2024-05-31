import {
  DefaultButton,
  Stack,
  VerticalDivider,
} from '@fluentui/react';
import { useObjects } from 'components/Provider';


const gapStack = { childrenGap: 5 };

export const PivotScene = () => {
  const {
    handleClearObjects,
  } = useObjects();

  return (
    <Stack
      tokens={gapStack}
      style={{
        height: '100%',
      }}
    >
      <VerticalDivider />
      <DefaultButton
        text="Resetar"
        onClick={handleClearObjects}

      />
    </Stack>
  );
};
