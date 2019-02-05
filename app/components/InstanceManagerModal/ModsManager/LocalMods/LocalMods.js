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
import { connect } from 'react-redux';
import { Button, Table, Switch, Input, Checkbox } from 'antd';
import { PACKS_PATH } from '../../../../constants';

import styles from './LocalMods.scss';

const fs = Promise.promisifyAll(fss);

type Props = {};

const LocalMods = props => {
  const [mods, setMods] = useState([]);
  const [filteredMods, setFilteredMods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const listRef = React.createRef();

  const modsFolder = path.join(PACKS_PATH, props.match.params.instance, 'mods');
  let watcher;
  console.log(props);
  useEffect(async () => {
    try {
      await fs.accessAsync(modsFolder);
    } catch (err) {
      await makeDir(modsFolder);
    }
    getMods();
    // return watcher.close(); // Cleaning up the watcher when the component unmounts
  }, []);

  const Mod = ({ index, style, toggleSize }) => (
    <div
      className={index % 2 ? styles.listItemOdd : styles.listItemEven}
      style={style}
    >
      <div className={styles.innerItemMod}>
        <Checkbox />
        {filteredMods[index].name}{' '}
        <Button type="primary" size="small" onClick={() => toggleSize(index)}>
          Manage
        </Button>
      </div>
    </div>
  );

  const filterMapMods = mods => {
    return mods
      .filter(el => el !== 'GDLCompanion.jar' && el !== 'LJF.jar')
      .filter(el => path.extname(el) === '.zip' || path.extname(el) === '.jar')
      .map(el => {
        return {
          name: el,
          state: path.extname(el) !== '.disabled',
          key: el,
          height: 50
        };
      });
  };

  const getMods = async () => {
    let modsList = filterMapMods(await fs.readdirAsync(modsFolder));

    setMods(modsList);
    setFilteredMods(modsList);
    // Watches for any changes in the packs dir. TODO: Optimize
    watcher = fss.watch(modsFolder, async () => {
      modsList = filterMapMods(await fs.readdirAsync(modsFolder));
      setMods(modsList);
      setFilteredMods(modsList);
    });
  };

  const filterMods = e => {
    setSearchQuery(e.target.value.toLowerCase());
    const modsList = mods.filter(mod =>
      mod.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredMods(modsList);
  };

  const getSize = i => {
    return filteredMods[i].height;
  };

  const toggleSize = async i => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(i);
    }

    if (filteredMods[i].height === 50) {
      const zipFile = new Zip(path.join(modsFolder, filteredMods[i].name));
      const mcmodInfo = JSON.parse(zipFile.readAsText('mcmod.info'));
    } else {
    }

    const newMods = Object.assign([...filteredMods], {
      [i]: {
        ...filteredMods[i],
        height: filteredMods[i].height === 50 ? 400 : 50
      }
    });
    setFilteredMods(newMods);
  };

  if (mods.length === 0) {
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
      <div style={{ height: 60, width: '100%' }}>
        <Input
          allowClear
          onChange={filterMods}
          size="large"
          placeholder="Filter mods"
          style={{ width: '80%' }}
        />
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
            style={{
              height: 38,
              top: -1,
              position: 'relative',
              marginLeft: 10
            }}
          >
            Add Mods
          </Button>
        </Link>
      </div>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height - 60}
            itemCount={filteredMods.length}
            itemSize={getSize}
            width={width}
          >
            {props => <Mod {...props} toggleSize={toggleSize} />}
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
