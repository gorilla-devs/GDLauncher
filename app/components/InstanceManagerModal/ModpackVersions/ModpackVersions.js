import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getAddon, getAddonFiles, getAddonFileChangelog } from '../../../utils/cursemeta';
import { readConfig, updateConfig } from '../../../utils/instances';
import { Select, Button } from 'antd';
import Promise from 'bluebird';
import { promises } from 'fs';
import fse from 'fs-extra';
import path from 'path';
import { PACKS_PATH } from '../../../constants';

const ModpackVersions = props => {
  const [versions, setVersions] = useState([]);
  const [installedVersion, setInstalledVersion] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(0);
  const [loading, setLoading] = useState(false);

  const instances = useSelector(state => state.instancesManager.instances);
  const ownInstance = instances.find(instance => instance.name === props.instance);

  const initVersions = async () => {
    const addons = await getAddonFiles(ownInstance.projectID);
    const localAddons = [];
    await Promise.all(addons.map(async addon => {
      const changelog = await getAddonFileChangelog(ownInstance.projectID, addon.id);
      localAddons.push({
        ...addon,
        changelog
      });
    }));
    const sortedVersions = _.orderBy(localAddons, ['fileDate'], ['desc']);
    setVersions(sortedVersions);
  };

  const initInstalledVersion = async () => {
    const config = await readConfig(props.instance);
    setInstalledVersion(config.modpackVersion);
  };

  const removeModpackFiles = async () => {
    setLoading(true);
    const { overrideFiles, mods } = await readConfig(props.instance);
    // Deleting overrides
    const sortedFiles = overrideFiles.sort((a, b) => b.length - a.length);
    await Promise.mapSeries(sortedFiles, async file => {
      try {
        const filePath = path.join(PACKS_PATH, props.instance, file);
        const lstat = await promises.lstat(filePath)
        if (lstat.isFile()) {
          await fse.remove(filePath);
        }
        if (lstat.isDirectory()) {
          const dirFiles = await promises.readdir(filePath);
          if (dirFiles.length === 0) {
            await fse.remove(filePath);
          }
        }
      } catch (err) { }
    });
    // Deleting old mods
    await Promise.mapSeries(mods, async mod => {
      try {
        const filePath = path.join(PACKS_PATH, props.instance, 'mods', mod.fileName);
        await fse.remove(filePath);
      } catch (err) { }
    });
    const newMods = mods.filter(mod => !mod.isModFromModpack);
    await updateConfig(props.instance, { mods: newMods }, ['overrideFiles']);

    setLoading(false);
    props.close();
  };

  useEffect(() => {
    initVersions();
    initInstalledVersion();
  }, []);

  if (versions.length === 0) {
    return (
      <div>Loading...</div>
    )
  }

  return (
    <div style={{
      height: '100%',
      width: '100%'
    }}>
      <div style={{
        display: 'block',
        margin: '0 auto',
        width: '80%',
        height: '100%',
        textAlign: 'center'
      }}>
        <div>Installed Version: {installedVersion}</div>
        <Select
          size="large"
          style={{ width: 335, display: 'inline-block', marginTop: 10 }}
          placeholder="Select a version"
          loading={versions.length === 0}
          onChange={setSelectedVersion}
          defaultValue={0}
        >
          {versions.map((version, index) => (
            <Select.Option key={index} value={index}>
              {version.displayName}
            </Select.Option>
          ))}
        </Select>
        <div style={{ height: 'calc(100% - 150px)', overflow: 'scroll', overflowX: 'hidden', backgroundColor: 'var(--secondary-color-2)', marginTop: 10 }}>
          <span
            dangerouslySetInnerHTML={{
              __html: versions[selectedVersion].changelog
            }}
          />
        </div>
        <Button
          type="primary"
          style={{ marginTop: 15 }}
          onClick={removeModpackFiles}
          loading={loading}
        >
          Update Modpack
        </Button>
      </div>
    </div>
  );
};

export default ModpackVersions;