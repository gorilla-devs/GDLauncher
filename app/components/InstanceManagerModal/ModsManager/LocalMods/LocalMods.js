import React, { useState, useEffect } from 'react';
import path from 'path';
import Zip from 'adm-zip';
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

const LocalMods = props => {
  const [filteredMods, setFilteredMods] = useState(props.localMods);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setFilteredMods(props.localMods);
    filterMods(searchQuery);
  }, [props.localMods]);

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
          <FontAwesomeIcon className={styles.deleteIcon} icon={faTrash} />
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

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(LocalMods);
