import React, { useEffect } from 'react';
import { Input, Button } from 'antd';
import {
  faUndo,
  faCheck,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import JavaMemorySlider from '../../Settings/components/JavaManager/javaMemorySlider';
import styles from './JavaManagerCard.scss';

function JavaArgInput(props) {
  return (
    <React.Fragment>
      <Input
        value={props.overrideArgs}
        style={{
          display: 'inline-block',
          maxWidth: '74%',
          marginRight: '10px',
          marginBottom: 4,
          marginTop: 4,
          backgroundColor: 'var(--secondary-color-1)',
          marginLeft: '1%'
        }}
        onChange={e =>
          props.setOverrideArgsInput(e.target.value)
        }
      />
      <Button.Group className={styles.btnGroup}>
        <Button
          className={styles.btnGroup}
          onClick={() => props.updateArgs()}
          type="primary"
        >
          <FontAwesomeIcon icon={faCheck} />
        </Button>
        <Button
          className={styles.btnGroup}
          type="primary"
          onClick={() => props.resetArgs()}
        >
          <FontAwesomeIcon icon={faUndo} />
        </Button>
      </Button.Group>
    </React.Fragment>
  );
}

export default JavaArgInput;
