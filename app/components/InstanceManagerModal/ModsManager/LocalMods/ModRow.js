// @flow

import React from 'react';
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
  filteredMods: [],
  setFilteredMods: () => mixed,
  instance: string
};

export default ({
  index,
  style,
  toggleSize,
  filteredMods,
  setFilteredMods,
  instance
}: Props) => {
  const modsFolder = path.join(PACKS_PATH, instance, 'mods');
  const selectMod = i => {
    const newMods = Object.assign([...filteredMods], {
      [i]: {
        ...filteredMods[i],
        selected: !filteredMods[i].selected
      }
    });
    setFilteredMods(newMods);
  };

  const deleteMod = async i => {
    // Remove the actual file
    await promisify(fs.unlink)(path.join(modsFolder, filteredMods[i].name));
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
        mods: config.mods.filter(v => v.fileNameOnDisk !== filteredMods[i].name)
      })
    );
  };

  const toggleDisableMod = async (enabled, index) => {
    if (enabled) {
      await promisify(fs.rename)(
        path.join(modsFolder, filteredMods[index].name),
        path.join(modsFolder, filteredMods[index].name.replace('.disabled', ''))
      );
    } else {
      await promisify(fs.rename)(
        path.join(modsFolder, filteredMods[index].name),
        path.join(modsFolder, `${filteredMods[index].name}.disabled`)
      );
    }
  };
  return (
    <div
      className={index % 2 ? styles.listItemOdd : styles.listItemEven}
      style={style}
    >
      <div className={styles.innerItemMod}>
        <div>
          <Checkbox
            onChange={() => selectMod(index)}
            checked={filteredMods[index].selected}
          />
          <Switch
            checked={filteredMods[index].state}
            style={{
              marginLeft: 15
            }}
            onChange={v => toggleDisableMod(v, index)}
          />
        </div>
        {filteredMods[index].name.replace('.disabled', '')}
        <div>
          <FontAwesomeIcon
            className={styles.editIcon}
            icon={faEdit}
            onClick={() => toggleSize(index)}
          />
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
