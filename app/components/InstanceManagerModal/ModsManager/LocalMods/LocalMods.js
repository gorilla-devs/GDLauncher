import React, { useState, useEffect, memo } from 'react';
import path from 'path';
import Zip from 'adm-zip';
import fs from 'fs';
import { promisify } from 'util';
import { isEqual } from 'lodash';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { Button, Input, Checkbox, Switch } from 'antd';
import ModRow from './ModRow';
import { PACKS_PATH } from '../../../../constants';

import styles from './LocalMods.scss';
import { getInstance } from '../../../../utils/selectors';


const LocalModsComponent = props => {
  const mapMods = mods => {
    return mods
      .filter(el => el !== 'GDLCompanion.jar' && el !== 'LJF.jar')
      .map(v => ({
        name: v.name,
        state: path.extname(v.name) !== '.disabled',
        key: v.name,
        height: 50,
        selected: false,
        projectID: v.projectID || null,
        fileID: v.fileID || null,
        version: props.match.params.version,
        fileDate: v.fileDate || null,
      }))
  }
  
  const [filteredMods, setFilteredMods] = useState(mapMods(props.instanceData.mods));
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    setFilteredMods(mapMods(props.instanceData.mods));
    filterMods(searchQuery);
  }, [props.instanceData]);
  
  const listRef = React.createRef();
  

  const modsFolder = path.join(PACKS_PATH, props.match.params.instance, 'mods');

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

  const filterMods = v => {
    setSearchQuery(v.toLowerCase());
    if (v === '') {
      setFilteredMods(mapMods(props.instanceData.mods));
    } else {
      const modsList = mapMods(props.instanceData.mods).filter(mod =>
        mod.name.toLowerCase().includes(v.toLowerCase())
      );
      setFilteredMods(modsList);
    }
  };

  const deleteMod = async instancesPath => {
    // Remove the actual file
    await Promise.all(
      filteredMods
        .filter(m => m.selected === true)
        .map(obj => fs.unlinkSync(path.join(modsFolder, obj.name)))
    );
    // Remove the reference in the mods file json
    const config = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PACKS_PATH, instancesPath, 'config.json')
      )
    );

    await promisify(fs.writeFile)(
      path.join(PACKS_PATH, instancesPath, 'config.json'),
      JSON.stringify(
        {
          ...config,
          mods: filteredMods
            .filter(m => m.selected === false)
            .map(m => config.mods.find(mm => mm.fileNameOnDisk === m.name))
        },
        null,
        2
      )
    );
  };

  const getSize = i => {
    return filteredMods[i].height;
  };

  if (props.instanceData.mods.length === 0) {
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
            height: 40,
            marginLeft: 7
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
          <span style={{ width: 140 }}>
            {filteredMods.filter(v => v.selected === true).length} mods selected
          </span>
          <div>
            <FontAwesomeIcon
              className={styles.deleteIcon}
              icon={faTrash}
              onClick={() => deleteMod(props.match.params.instance)}
            />
          </div>
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
            <FontAwesomeIcon className={styles.plusIcon} icon={faPlus} />
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
            {propss => (
              <ModRow
                {...propss}
                toggleSize={toggleSize}
                modData={filteredMods[propss.index]}
                setFilteredMods={setFilteredMods}
                instance={props.match.params.instance}
              />
            )}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  const instanceData = getInstance(ownProps.match.params.instance)(state);
  return {
    instanceData
  };
}

const LocalMods = connect(mapStateToProps)(LocalModsComponent);


const MemoizedLocalMods = memo(LocalMods, (prev, next) => {
  return isEqual(prev.match, next.match);
});

export default MemoizedLocalMods;
