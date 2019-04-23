// @flow

import React, { useMemo } from 'react';
import fs from 'fs';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { promisify } from 'util';
import { Checkbox, Switch } from 'antd';
import { PACKS_PATH } from '../../../../constants';

import styles from './LocalMods.scss';

type Props = {
  index: number,
  style: {},
  toggleSize: () => mixed,
  modData: {},
  setFilteredMods: () => mixed,
  instance: string
};

const ModRow = ({
  index,
  style,
  toggleSize,
  modData,
  setFilteredMods,
  instance
}: Props) => {
  const modsFolder = path.join(PACKS_PATH, instance, 'mods');
  const selectMod = i => {
    setFilteredMods(prevMods =>
      Object.assign([...prevMods], {
        [i]: {
          ...prevMods[i],
          selected: !modData.selected
        }
      })
    );
  };

  const deleteMod = async i => {
    // Remove the actual file
    await promisify(fs.unlink)(path.join(modsFolder, modData.name));
    // Remove the reference in the mods file json
    const config = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PACKS_PATH, instance, 'config.json')
      )
    );
    await promisify(fs.writeFile)(
      path.join(PACKS_PATH, instance, 'config.json'),
      JSON.stringify({
        ...config,
        mods: config.mods.filter(v => v.fileNameOnDisk !== modData.name)
      })
    );
  };

  const toggleDisableMod = async (enabled, index) => {
    if (enabled) {
      await promisify(fs.rename)(
        path.join(modsFolder, modData.name),
        path.join(modsFolder, modData.name.replace('.disabled', ''))
      );
    } else {
      await promisify(fs.rename)(
        path.join(modsFolder, modData.name),
        path.join(modsFolder, `${modData.name}.disabled`)
      );
    }
  };
  return (
    <div
      className={index % 2 ? styles.listItemOdd : styles.listItemEven}
      style={style}
      onClick={() => toggleSize(index)}
      role="none"
      key={modData.name}
    >
      <div className={styles.innerItemMod}>
        <div>
          <Checkbox
            onChange={e => {
              e.stopPropagation();
              selectMod(index);
            }}
            checked={modData.selected}
          />
          <Switch
            checked={modData.state}
            style={{
              marginLeft: 15
            }}
            onChange={(v, e) => {
              e.stopPropagation();
              toggleDisableMod(v, index);
            }}
          />
        </div>
        {modData.name.replace('.disabled', '')}
        <div>
          <FontAwesomeIcon
            className={styles.deleteIcon}
            icon={faTrash}
            onClick={() => deleteMod(index)}
          />
        </div>
      </div>
    </div>
  );
};

export default ModRow;
