import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { remote } from 'electron';
import fss from 'fs';
import path from 'path';
import Promise from 'bluebird';
import Zip from 'adm-zip';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import makeDir from 'make-dir';
import log from 'electron-log';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { promisify } from 'util';
import { Button, Input, Checkbox } from 'antd';
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
        <Checkbox />
        {filteredMods[index].name}{' '}
        <div>
          <Button type="primary" size="small" onClick={() => toggleSize(index)}>
            <FontAwesomeIcon icon="edit" />
          </Button>
          <Button
            style={{ marginLeft: 5 }}
            type="primary"
            size="small"
            onClick={() => deleteMod(index)}
          >
            <FontAwesomeIcon icon="trash" />
          </Button>
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
    console.log(filteredMods[i]);
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
            width: '15%',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: 40
          }}
        >
          <Checkbox />
          <Button
            type="primary"
            size="small"
            style={{
              height: 30,
              width: 30,
              top: -1
            }}
          >
            <FontAwesomeIcon icon="trash" />
          </Button>
        </div>
        <Input
          allowClear
          onChange={e => filterMods(e.target.value)}
          size="large"
          placeholder="Filter mods"
          style={{ width: '75%' }}
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
            <Button
              type="primary"
              size="small"
              style={{
                height: 30,
                width: 30,
                top: -1
              }}
            >
              <FontAwesomeIcon icon="plus" />
            </Button>
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
