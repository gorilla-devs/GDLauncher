// @flow
import React, { Component } from 'react';
import { Button, Icon, message } from 'antd';
import fss from 'fs';
import { join, basename } from 'path';
import makeDir from 'make-dir';
import { Promise } from 'bluebird';
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
import { PACKS_PATH } from '../../constants';
import store from '../../localStore';

type Props = {
  selectInstance: () => void
};

let watcher;

const SortableItem = SortableElement(({ value }) => <DInstance name={value} />);

const SortableList = SortableContainer(({ items }) => {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
    </div>
  );
});

const fs = Promise.promisifyAll(fss);

export default class DManager extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.state = {
      instances: [],
      checkingInstances: true
    };
  }

  componentDidMount = () => {
    this.watchRoutine();
  };

  componentWillUnmount() {
    // Stop watching for changes when this component is unmounted
    try {
      watcher.close();
    } catch (err) {
      log.error(err);
    }
  }

  watchRoutine = async () => {
    try {
      await fs.accessAsync(PACKS_PATH);
    } catch (e) {
      await makeDir(PACKS_PATH);
    }
    this.setState({
      instances: await this.getDirectories(PACKS_PATH)
    });
    // Watches for any changes in the packs dir. TODO: Optimize
    try {
      watcher = fss.watch(PACKS_PATH, async () => {
        try {
          await fs.accessAsync(PACKS_PATH);
        } catch (e) {
          await makeDir(PACKS_PATH);
        }
        this.setState({
          instances: await this.getDirectories(PACKS_PATH)
        });
      });
      watcher.on('error', async err => {
        try {
          await fs.accessAsync(PACKS_PATH);
        } catch (e) {
          await makeDir(PACKS_PATH);
          this.watchRoutine();
        }
      });
    } catch (error) {
      log.error(error);
      if (error.message === `watch ${PACKS_PATH} ENOSPC`) {
        message.error(
          <span>
            There was an error with inotify limit. see
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/guard/listen/wiki/Increasing-the-amount-of-inotify-watchers"
            >
              {' '}
              here
            </a>
          </span>
        );
      } else {
        message.error('Cannot update instances in real time');
      }
    } finally {
      this.setState({
        checkingInstances: false
      });
    }
  };

  handleScroll = () => {
    hideMenu();
  };

  /* eslint-disable */
  openLink(url) {
    require('electron').shell.openExternal(url);
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      instances: arrayMove(this.state.instances, oldIndex, newIndex)
    });
  };

  onSortStart = ({ node, index, collection }) => {
    hideMenu();
  };

  isDirectory = source => fss.lstatSync(source).isDirectory();
  getDirectories = async source =>
    await fs
      .readdirAsync(source)
      .map(name => join(source, name))
      .filter(this.isDirectory)
      .map(dir => basename(dir));

  /* eslint-enable */

  render() {
    return (
      <main
        className={styles.main}
        onClick={e => {
          e.stopPropagation();
          this.props.selectInstance(null);
        }}
      >
        <div className={styles.header}>
          <div className={styles.headerButtons}>
            <div>
              <Button type="primary" disabled className={styles.browseModpacks}>
                Browse Curse Modpacks
              </Button>
            </div>
            <div>
              <Link
                to={{
                  pathname: '/InstanceCreatorModal',
                  state: { modal: true }
                }}
              >
                <Button type="primary" className={styles.addVanilla}>
                  Add New Instance
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <ContextMenuTrigger id="contextMenu-dmanager">
          <div className={styles.content} onScroll={this.handleScroll}>
            {this.state.instances.length === 0 &&
            !this.state.checkingInstances ? (
              <h1 className={styles.NoServerCreated}>
                YOU HAVEN'T ADDED ANY INSTANCE YET
              </h1>
            ) : (
              <SortableList
                items={this.state.instances}
                onSortEnd={this.onSortEnd}
                onSortStart={this.onSortStart}
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
            this.props.selectInstance(null);
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
            <i className="fas fa-play" style={{ marginRight: '8px' }} />
            Add New Instance
          </MenuItem>
        </ContextMenu>
      </main>
    );
  }
}
