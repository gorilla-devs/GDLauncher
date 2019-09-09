// @flow
import React, { Component } from 'react';
import { Button, Icon, message } from 'antd';
import fss from 'fs';
import { join, basename } from 'path';
import makeDir from 'make-dir';
import { Promise } from 'bluebird';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import Link from 'react-router-dom/Link';
import log from 'electron-log';
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { hideMenu } from 'react-contextmenu/es6/actions';
import styles from './DManager.scss';
import DInstance from '../../containers/DInstance';
import { history } from '../../store/configureStore';
import { useDispatch, useSelector } from 'react-redux';
import { updateSelectedInstance } from '../../reducers/actions';

const SortableItem = SortableElement(({ value }) => <DInstance name={value} />);

const SortableList = SortableContainer(({ items }) => {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value.name} />
      ))}
    </div>
  );
});

const DManager = props => {
  const dispatch = useDispatch();
  const instances = useSelector(state => state.instances);

  const handleScroll = () => {
    hideMenu();
  };

  /* eslint-disable */
  const openLink(url) {
    require('electron').shell.openExternal(url);
  }

  /* eslint-enable */

  const onSortEnd = ({ oldIndex, newIndex }) => {
    // this.setState({
    //   instances: arrayMove(this.state.instances, oldIndex, newIndex)
    // });
  };

  const onSortStart = ({ node, index, collection }) => {
    hideMenu();
  };

  return (
    <main
      className={styles.main}
      onClick={e => {
        e.stopPropagation();
        dispatch(updateSelectedInstance(null));
      }}
    >
      <div className={styles.header}>
        <div className={styles.headerButtons}>
          <div>
            <Link to="/curseModpacksBrowser">
              <Button type="primary" className={styles.browseModpacks}>
                Browse Curse Modpacks
                </Button>
            </Link>
          </div>
          <div>
            <Button.Group>
              <Link
                to={{
                  pathname: '/InstanceCreatorModal',
                  state: { modal: true }
                }}
              >
                <Button type="primary">Add New Instance</Button>
              </Link>
              <Link
                to={{
                  pathname: '/importPack',
                  state: { modal: true }
                }}
              >
                <Button type="primary">Import</Button>
              </Link>
            </Button.Group>
          </div>
        </div>
      </div>
      <ContextMenuTrigger id="contextMenu-dmanager">
        <div className={styles.content} onScroll={handleScroll}>
          {instances.length === 0 ? (
            <h1 className={styles.NoServerCreated}>
              YOU HAVEN'T ADDED ANY INSTANCE YET
              </h1>
          ) : (
              <SortableList
                items={instances}
                onSortEnd={onSortEnd}
                onSortStart={onSortStart}
                lockToContainerEdges
                axis="xy"
                distance={5}
              />
            )}
        </div>
      </ContextMenuTrigger>
      <ContextMenu
        id="contextMenu-dmanager"
        onShow={e => {
          e.stopPropagation();
          dispatch(updateSelectedInstance(null));
        }}
      >
        <MenuItem
          data={{ foo: 'bar' }}
          onClick={() =>
            history.push({
              pathname: '/InstanceCreatorModal',
              state: { modal: true }
            })
          }
        >
          <FontAwesomeIcon icon={faPlay} style={{ marginRight: '8px' }} />
          Add New Instance
          </MenuItem>
      </ContextMenu>
    </main>
  );
}

export default DManager;