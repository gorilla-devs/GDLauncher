import React, { useState, useEffect } from 'react';
import fss from 'fs';
import path from 'path';
import Zip from 'adm-zip';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import fs from 'fs';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { promisify } from 'util';
import { Button, Input, Checkbox, Switch } from 'antd';
import { PACKS_PATH } from '../../../../constants';

import styles from './LocalMods.scss';

const LocalMods = props => {
  const [filteredMods, setFilteredMods] = useState(props.localMods);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setFilteredMods(props.localMods);
    filterMods(searchQuery);
  }, [props.localMods]);

  const listRef = React.createRef();

  const modsFolder = path.join(PACKS_PATH, props.match.params.instance, 'mods');

  const Mod = ({ index, style, toggleSize }) => (
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
            style={{ marginLeft: 15 }}
            onChange={v => toggleDisableMod(v, index)}
          />
        </div>
        {filteredMods[index].name.replace('.disabled', '')}{' '}
        <div>
          <FontAwesomeIcon
            className={styles.editIcon}
            icon="edit"
            onClick={() => toggleSize(index)}
          />
          <FontAwesomeIcon
            className={styles.deleteIcon}
            icon="trash"
            onClick={() => deleteMod(index)}
          />
        </div>
      </div>
    </div>
  );

  const filterMods = v => {
    setSearchQuery(v.toLowerCase());
    if (v === '') {
      setFilteredMods(props.localMods);
    } else {
      const modsList = props.localMods.filter(mod =>
        mod.name.toLowerCase().includes(v.toLowerCase())
      );
      setFilteredMods(modsList);
    }
  };

  const getSize = i => {
    return filteredMods[i].height;
  };

  const selectMod = i => {
    const newMods = Object.assign([...filteredMods], {
      [i]: {
        ...filteredMods[i],
        selected: !filteredMods[i].selected
      }
    });
    setFilteredMods(newMods);
  };

  const toggleSize = i => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(i);
    }

    if (filteredMods[i].height === 50) {
      const zipFile = new Zip(path.join(modsFolder, filteredMods[i].name));
      const mcmodInfo = JSON.parse(zipFile.readAsText('mcmod.info'));
    }

    const newMods = Object.assign([...filteredMods], {
      [i]: {
        ...filteredMods[i],
        height: filteredMods[i].height === 50 ? 400 : 50
      }
    });
    setFilteredMods(newMods);
  };

  const deleteMod = async i => {
    // Remove the actual file
    await promisify(fss.unlink)(path.join(modsFolder, filteredMods[i].name));
    // Remove the reference in the mods file json
    const oldMods = JSON.parse(
      await promisify(fss.readFile)(
        path.join(PACKS_PATH, props.match.params.instance, 'mods.json')
      )
    );
    await promisify(fss.writeFile)(
      path.join(PACKS_PATH, props.match.params.instance, 'mods.json'),
      JSON.stringify(
        oldMods.filter(v => v.fileNameOnDisk !== filteredMods[i].name)
      )
    );
  };

  const toggleDisableMod = async (enabled, index) => {
    if (enabled) {
      await promisify(fs.rename)(
        path.join(modsFolder, filteredMods[index].name),
        path.join(modsFolder, filteredMods[index].name.replace('.disabled', ''))
      );
    } else {
      await fs.renameAsync(
        path.join(modsFolder, filteredMods[index].name),
        path.join(modsFolder, `${filteredMods[index].name}.disabled`)
      );
    }
  };

  if (props.localMods.length === 0) {
    return (
      <div className={styles.noMod}>
        <div>
          No mod is installed
          <br />
          <Link
            to={{
              pathname: `/editInstance/${
                props.match.params.instance
              }/mods/browse/${props.match.params.version}`,
              state: { modal: true }
            }}
            replace
          >
            <Button type="primary">Add Mods</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div
        style={{
          height: 40,
          width: '100%',
          background: 'var(--secondary-color-2)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            width: '35%',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: 40
          }}
        >
          <Checkbox
            indeterminate={
              filteredMods.find(v => v.selected === true) &&
              filteredMods.find(v => v.selected === false)
            }
            checked={filteredMods.every(v => v.selected === true)}
            onChange={v => {
              let selected = false;
              if (filteredMods.find(s => s.selected === false)) {
                selected = true;
              }
              setFilteredMods(
                filteredMods.map(x => ({
                  ...x,
                  selected
                }))
              );
            }}
          />
          {filteredMods.filter(v => v.selected === true).length} mods selected
          <FontAwesomeIcon className={styles.deleteIcon} icon="trash" />
        </div>
        <Input
          allowClear
          onChange={e => filterMods(e.target.value)}
          size="large"
          placeholder="Filter mods"
          style={{ width: '55%' }}
          value={searchQuery}
        />
        <div
          style={{
            width: '10%',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: 40
          }}
        >
          <Link
            to={{
              pathname: `/editInstance/${
                props.match.params.instance
              }/mods/browse/${props.match.params.version}`,
              state: { modal: true }
            }}
            replace
          >
            <FontAwesomeIcon className={styles.plusIcon} icon="plus" />
          </Link>
        </div>
      </div>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height - 40}
            itemCount={filteredMods.length}
            itemSize={getSize}
            width={width}
          >
            {propss => <Mod {...propss} toggleSize={toggleSize} />}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(LocalMods);
