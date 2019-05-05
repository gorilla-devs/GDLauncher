import React from 'react';
import { Input, Button } from 'antd';
import { debounce } from 'lodash';
import {
  faUndo,
  faCheck,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const JavaArgumentInput = ({
  overrideArgs,
  onChange,
  updateArgs,
  resetArgs
}) => {
  const updateConfig = v => {
    updateArgs(v);
  };
  const debounced = debounce(updateConfig, 300);

  const onInputChange = e => {
    onChange(e.target.value);
    debounced(e.target.value);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Input
        value={overrideArgs}
        style={{
          display: 'inline-block',
          maxWidth: '85%',
          marginRight: '10px',
          marginBottom: 4,
          marginTop: 4,
          marginLeft: '1%'
        }}
        onChange={onInputChange}
      />
      <Button
        style={{ width: '10%', marginBottom: 4, marginTop: 4 }}
        type="primary"
        onClick={resetArgs}
      >
        <FontAwesomeIcon icon={faUndo} />
      </Button>
    </div>
  );
};

export default JavaArgumentInput;
