import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getAddon, getAddonFiles, getAddonFileChangelog } from '../../../utils/cursemeta';
import { readConfig } from '../../../utils/instances';
import { Select } from 'antd';

const ModpackVersions = props => {
  const [versions, setVersions] = useState([]);
  const [installedVersion, setInstalledVersion] = useState(null);

  const instances = useSelector(state => state.instancesManager.instances);
  const ownInstance = instances.find(instance => instance.name === props.match.params.instance);

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
    setVersions(_.orderBy(localAddons, ['fileDate'], ['desc']));
  };

  const initInstalledVersion = async () => {
    const config = await readConfig(props.match.params.instance);
    setInstalledVersion(config.modpackVersion);
  };


  useEffect(() => {
    initVersions();
    initInstalledVersion();
  }, []);

  console.log(versions)

  return (
    <div>
      <div>Installed Version: {installedVersion}</div>
      <Select
        size="large"
        style={{ width: 335, display: 'inline-block' }}
        placeholder="Select a version"
        loading={versions.length === 0}
      >
        {versions.map(version => (
          <Select.Option key={version.fileName}>
            {version.displayName}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default ModpackVersions;