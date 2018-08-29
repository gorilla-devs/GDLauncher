// @flow
import React, { Component } from 'react';
import { Button, Icon, message } from 'antd';
import { lstatSync, readdirSync, watch, existsSync } from 'fs';
import { join, basename } from 'path';
import mkdirp from 'mkdirp';
import Link from 'react-router-dom/Link';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { hideMenu } from 'react-contextmenu/es6/actions';
import styles from './DManager.css';
import DInstance from '../../containers/DInstance';
import { history } from '../../store/configureStore';
import { LAUNCHER_FOLDER, PACKS_FOLDER_NAME, APPPATH } from '../../constants';
import store from '../../localStore';

type Props = {
  selectInstance: () => void
};

const watchPath = `${APPPATH}${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`;
let watcher;

const SortableItem = SortableElement(({ value }) =>
  <DInstance name={value} />
);

const SortableList = SortableContainer(({ items }) => {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
    </div>
  );
});


export default class DManager extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    if (!existsSync(watchPath)) {
      mkdirp.sync(watchPath);
    }
    this.state = {
      instances: this.getDirectories(watchPath)
    };
    // Watches for any changes in the packs dir. TODO: Optimize
    try {
      watcher = watch(watchPath, () => {
        if (!existsSync(watchPath)) {
          mkdirp.sync(watchPath);
        }
        this.setState({
          instances: this.getDirectories(watchPath)
        });
      });
    } catch (error) {
      console.error(error);
      if (error.message === `watch ${watchPath} ENOSPC`) {
        message.error(
          <span>
            There was an error with inotify limit. see
          <a target="_blank" href="https://github.com/guard/listen/wiki/Increasing-the-amount-of-inotify-watchers"> here</a>
          </span>
        );
      } else {
        message.error('Cannot update instances in real time');
      }
    }
  }

  componentWillUnmount() {
    // Stop watching for changes when this component is unmounted
    try {
      watcher.close();
    } catch (err) {
      console.error(err);
    }
  }

  handleScroll = () => {
    hideMenu();
  }

  /* eslint-disable */
  openLink(url) {
    require('electron').shell.openExternal(url)
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      instances: arrayMove(this.state.instances, oldIndex, newIndex),
    });
  };

  isDirectory = source => lstatSync(source).isDirectory();
  getDirectories = source => readdirSync(source)
    .map(name => join(source, name))
    .filter(this.isDirectory)
    .map(dir => basename(dir));


  /* eslint-enable */

  render() {
    return (
      <main
        className={styles.main}
        onClick={(e) => { e.stopPropagation(); this.props.selectInstance(null) }}
      >
        <div className={styles.header}>
          <div className={styles.headerButtons}>
            <div>
              <Button type="primary" disabled className={styles.browseModpacks}>Browse Curse Modpacks</Button>
            </div>
            <div>
              <Link to={{ pathname: '/InstanceCreatorModal', state: { modal: true } }} >
                <Button type="primary" className={styles.addVanilla}>Add New Instance</Button>
              </Link>
              <Button type="primary" disabled className={styles.addForge}>Add New Forge</Button>
            </div>
          </div>
        </div>
        <ContextMenuTrigger id="contextMenu-dmanager">
          <div className={styles.content} onScroll={this.handleScroll}>
            {this.state.instances.length !== 0 ?
              <SortableList
                items={this.state.instances}
                onSortEnd={this.onSortEnd}
                lockToContainerEdges
                axis="xy"
                distance={5}
              /> :
              <h1 style={{
                textAlign: 'center',
                marginTop: '25vh',
                fontFamily: 'GlacialIndifferenceRegular',
                fontSize: '20px',
                fontWeight: '600',
                color: '#bdc3c7'
              }}>YOU HAVEN'T ADDED ANY INSTANCE YET</h1>
            }
          </div>
        </ContextMenuTrigger>
        <ContextMenu id="contextMenu-dmanager" onShow={(e) => { e.stopPropagation(); this.props.selectInstance(null); }}>
          <MenuItem data={{ foo: 'bar' }} onClick={() => history.push({ pathname: '/InstanceCreatorModal', state: { modal: true } })}>
            <i className="fas fa-play" style={{ marginRight: '8px' }} />
            Add New Instance
          </MenuItem>
        </ContextMenu>
      </main >
    );
  }
}
