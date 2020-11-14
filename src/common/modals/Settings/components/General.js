import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { ipcRenderer, clipboard } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fsa from 'fs-extra';
import { promises as fs } from 'fs';
import {
  faCopy,
  faDownload,
  faTachometerAlt,
  faTrash,
  faPlay,
  faToilet,
  faNewspaper,
  faFolder,
  faFire
} from '@fortawesome/free-solid-svg-icons';
import { Select, Tooltip, Button, Switch, Input, Checkbox } from 'antd';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import {
  _getCurrentAccount,
  _getDataStorePath,
  _getInstancesPath,
  _getTempPath
} from '../../../utils/selectors';
import {
  updateDiscordRPC,
  updateHideWindowOnGameLaunch,
  updatePotatoPcMode,
  updateShowNews,
  updateCurseReleaseChannel
} from '../../../reducers/settings/actions';
import HorizontalLogo from '../../../../ui/HorizontalLogo';
import { updateConcurrentDownloads } from '../../../reducers/actions';
import { openModal } from '../../../reducers/modals/actions';
import { extractFace } from '../../../../app/desktop/utils';
import i18n from '../../../config/i18next';

const MyAccountPrf = styled.div`
  width: 100%;
  height: 100%;
`;

const PersonalData = styled.div`
  margin-top: 38px;
  width: 100%;
`;

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  margin-bottom: 20px;
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.primary};
  z-index: 1;
  text-align: left;
`;

const ProfileImage = styled.img`
  position: relative;
  top: 20px;
  left: 20px;
  background: #212b36;
  width: 50px;
  height: 50px;
`;

const ImagePlaceHolder = styled.div`
  position: relative;
  top: 20px;
  left: 20px;
  background: #212b36;
  width: 50px;
  height: 50px;
`;

const UsernameContainer = styled.div`
  text-align: left;
`;

const UuidContainer = styled.div`
  text-align: left;
`;

const Uuid = styled.div`
  font-size: smaller;
  font-weight: 200;
  color: ${props => props.theme.palette.grey[100]};
  display: flex;
`;

const Username = styled.div`
  font-size: smaller;
  font-weight: 200;
  color: ${props => props.theme.palette.grey[100]};
  display: flex;
`;

const PersonalDataContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  background: ${props => props.theme.palette.grey[900]};
  border-radius: ${props => props.theme.shape.borderRadius};
`;

const Hr = styled.div`
  height: 25px;
`;

const ReleaseChannel = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 100%;
  height: 90px;
  color: ${props => props.theme.palette.text.third};
  p {
    margin-bottom: 7px;
    color: ${props => props.theme.palette.text.secondary};
  }
  div {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  select {
    margin-left: auto;
    self-align: end;
  }
`;

const ParallelDownload = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 60px;
  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
  }
`;

const DiscordRpc = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
  }
`;

const LauncherVersion = styled.div`
  margin: 30px 0;
  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
    margin: 0 0 0 6px;
  }

  h1 {
    color: ${props => props.theme.palette.text.primary};
  }
`;
const CustomDataPathContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 140px;
  border-radius: ${props => props.theme.shape.borderRadius};

  h1 {
    width: 100%;
    font-size: 15px;
    font-weight: 700;
    color: ${props => props.theme.palette.text.primary};
    z-index: 1;
    text-align: left;
  }
`;

function copy(setCopied, copyText) {
  setCopied(true);
  clipboard.writeText(copyText);
  setTimeout(() => {
    setCopied(false);
  }, 500);
}

function dashUuid(UUID) {
  // UUID is segmented into: 8 - 4 - 4 - 4 - 12
  // Then dashes are added between.

  // eslint-disable-next-line
  return `${UUID.substring(0, 8)}-${UUID.substring(8, 12)}-${UUID.substring(
    12,
    16
  )}-${UUID.substring(16, 20)}-${UUID.substring(20, 32)}`;
}

const General = () => {
  const [version, setVersion] = useState(null);
  const [releaseChannel, setReleaseChannel] = useState(null);
  const currentAccount = useSelector(_getCurrentAccount);
  const hideWindowOnGameLaunch = useSelector(
    state => state.settings.hideWindowOnGameLaunch
  );
  const DiscordRPC = useSelector(state => state.settings.discordRPC);
  const potatoPcMode = useSelector(state => state.settings.potatoPcMode);
  const concurrentDownloads = useSelector(
    state => state.settings.concurrentDownloads
  );
  const updateAvailable = useSelector(state => state.updateAvailable);
  const dataStorePath = useSelector(_getDataStorePath);
  const instancesPath = useSelector(_getInstancesPath);
  const isPlaying = useSelector(state => state.startedInstances);
  const queuedInstances = useSelector(state => state.downloadQueue);
  const tempPath = useSelector(_getTempPath);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [deletingInstances, setDeletingInstances] = useState(false);
  const userData = useSelector(state => state.userData);
  const [dataPath, setDataPath] = useState(userData);
  const [moveUserData, setMoveUserData] = useState(false);
  const showNews = useSelector(state => state.settings.showNews);
  const [loadingMoveUserData, setLoadingMoveUserData] = useState(false);
  const curseReleaseChannel = useSelector(
    state => state.settings.curseReleaseChannel
  );

  const dispatch = useDispatch();

  const disableInstancesActions =
    Object.keys(queuedInstances).length > 0 ||
    Object.keys(isPlaying).length > 0;

  useEffect(() => {
    ipcRenderer.invoke('getAppVersion').then(setVersion).catch(console.error);
    extractFace(currentAccount.skin).then(setProfileImage).catch(console.error);
    ipcRenderer
      .invoke('getAppdataPath')
      .then(appData =>
        fsa
          .readFile(path.join(appData, 'gdlauncher_next', 'rChannel'))
          .then(v => setReleaseChannel(parseInt(v.toString(), 10)))
          .catch(() => setReleaseChannel(0))
      )
      .catch(console.error);
  }, []);

  const clearSharedData = async () => {
    setDeletingInstances(true);
    try {
      await fsa.emptyDir(dataStorePath);
      await fsa.emptyDir(instancesPath);
      await fsa.emptyDir(tempPath);
    } catch (e) {
      console.error(e);
    }
    setDeletingInstances(false);
  };

  const changeDataPath = async () => {
    setLoadingMoveUserData(true);
    const appData = await ipcRenderer.invoke('getAppdataPath');
    const appDataPath = path.join(appData, 'gdlauncher_next');

    const notCopiedFiles = [
      'Cache',
      'Code Cache',
      'Dictionaries',
      'GPUCache',
      'Cookies',
      'Cookies-journal'
    ];
    await fsa.writeFile(path.join(appDataPath, 'override.data'), dataPath);

    if (moveUserData) {
      try {
        const files = await fs.readdir(userData);
        await Promise.all(
          files.map(async name => {
            if (!notCopiedFiles.includes(name)) {
              await fsa.copy(
                path.join(userData, name),
                path.join(dataPath, name),
                {
                  overwrite: true
                }
              );
            }
          })
        );
      } catch (e) {
        console.error(e);
      }
    }
    setLoadingMoveUserData(false);
    ipcRenderer.invoke('appRestart');
  };

  const openFolder = async () => {
    const { filePaths, canceled } = await ipcRenderer.invoke(
      'openFolderDialog',
      userData
    );
    if (!filePaths[0] || canceled) return;
    setDataPath(filePaths[0]);
  };

  return (
    <MyAccountPrf>
      <PersonalData>
        <MainTitle>{i18n.t('settings:general')}</MainTitle>
        <PersonalDataContainer>
          {profileImage ? (
            <ProfileImage src={`data:image/jpeg;base64,${profileImage}`} />
          ) : (
            <ImagePlaceHolder />
          )}
          <div
            css={`
              margin: 20px 20px 20px 40px;
              width: 330px;
            `}
          >
            <UsernameContainer>
              {i18n.t('settings:username')} <br />
              <Username>{currentAccount.selectedProfile.name}</Username>
            </UsernameContainer>
            <UuidContainer>
              UUID
              <br />
              <Uuid>
                {dashUuid(currentAccount.selectedProfile.id)}
                <Tooltip title={copiedUuid ? 'Copied' : 'Copy'} placement="top">
                  <div
                    css={`
                      width: 13px;
                      height: 14px;
                      margin: 0;
                      margin-left: 10px;
                    `}
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      onClick={() =>
                        copy(
                          setCopiedUuid,
                          dashUuid(currentAccount.selectedProfile.id)
                        )
                      }
                    />
                  </div>
                </Tooltip>
              </Uuid>
            </UuidContainer>
          </div>
        </PersonalDataContainer>
      </PersonalData>
      <Hr />
      <ReleaseChannel>
        <Title>{i18n.t('settings:release_channel.title')}</Title>
        <div>
          <div
            css={`
              width: 400px;
            `}
          >
            {i18n.t('settings:release_channel.description')}
          </div>
          <Select
            css={`
              width: 100px;
            `}
            onChange={async e => {
              const appData = await ipcRenderer.invoke('getAppdataPath');
              setReleaseChannel(e);
              await fsa.writeFile(
                path.join(appData, 'gdlauncher_next', 'rChannel'),
                e
              );
            }}
            value={releaseChannel}
          >
            <Select.Option value={0}>
              {i18n.t('settings:release_channel.select.stable')}
            </Select.Option>
            <Select.Option value={1}>
              {i18n.t('settings:release_channel.select.beta')}
            </Select.Option>
          </Select>
        </div>
      </ReleaseChannel>
      <Hr />
      <Title>
        {i18n.t('settings:concurrent_downloads.title')}
        &nbsp; <FontAwesomeIcon icon={faTachometerAlt} />
      </Title>
      <ParallelDownload>
        <p
          css={`
            margin: 0;
            width: 400px;
          `}
        >
          {i18n.t('settings:concurrent_downloads.description')}
        </p>

        <Select
          onChange={v => dispatch(updateConcurrentDownloads(v))}
          value={concurrentDownloads}
          css={`
            width: 100px;
            text-align: start;
          `}
        >
          {[...Array(20).keys()]
            .map(x => x + 1)
            .map(x => (
              <Select.Option key={x} value={x}>
                {x}
              </Select.Option>
            ))}
        </Select>
      </ParallelDownload>
      <Hr />
      <Title>
        {i18n.t('settings:preferred_curse_release_channel.title')}
        &nbsp; <FontAwesomeIcon icon={faFire} />
      </Title>
      <ParallelDownload>
        <p
          css={`
            margin: 0;
            width: 400px;
          `}
        >
          {i18n.t('settings:preferred_curse_release_channel.description')}
        </p>
        <Select
          css={`
            width: 100px;
            text-align: start;
          `}
          onChange={e => dispatch(updateCurseReleaseChannel(e))}
          value={curseReleaseChannel}
        >
          <Select.Option value={1}>
            {i18n.t('settings:preferred_curse_release_channel.select.stable')}
          </Select.Option>
          <Select.Option value={2}>
            {i18n.t('settings:preferred_curse_release_channel.select.beta')}
          </Select.Option>
          <Select.Option value={3}>
            {i18n.t('settings:preferred_curse_release_channel.select.alpha')}
          </Select.Option>
        </Select>
      </ParallelDownload>
      <Hr />
      <Title
        css={`
          margin-top: 0px;
        `}
      >
        {i18n.t('settings:discord_integration.title')}
        &nbsp; <FontAwesomeIcon icon={faDiscord} />
      </Title>
      <DiscordRpc>
        <p
          css={`
            width: 350px;
          `}
        >
          {i18n.t('settings:discord_integration.description')}
        </p>
        <Switch
          onChange={e => {
            dispatch(updateDiscordRPC(e));
            if (e) {
              ipcRenderer.invoke('init-discord-rpc');
            } else {
              ipcRenderer.invoke('shutdown-discord-rpc');
            }
          }}
          checked={DiscordRPC}
        />
      </DiscordRpc>
      <Hr />
      <Title
        css={`
          margin-top: 0px;
        `}
      >
        {i18n.t('settings:minecraft_news.title')}
        &nbsp; <FontAwesomeIcon icon={faNewspaper} />
      </Title>
      <DiscordRpc>
        <p
          css={`
            width: 350px;
          `}
        >
          {i18n.t('settings:minecraft_news.description')}
        </p>
        <Switch
          onChange={e => {
            dispatch(updateShowNews(e));
          }}
          checked={showNews}
        />
      </DiscordRpc>
      <Hr />
      <Title
        css={`
          margin-top: 0px;
        `}
      >
        {i18n.t('settings:hide_launcher_while_playing.title')}
        &nbsp; <FontAwesomeIcon icon={faPlay} />
      </Title>
      <DiscordRpc
        css={`
          margin-bottom: 30px;
        `}
      >
        <p
          css={`
            width: 500px;
          `}
        >
          {i18n.t('settings:hide_launcher_while_playing.description')}
        </p>
        <Switch
          onChange={e => {
            dispatch(updateHideWindowOnGameLaunch(e));
          }}
          checked={hideWindowOnGameLaunch}
        />
      </DiscordRpc>
      <Hr />
      <Title
        css={`
          margin-top: 0px;
        `}
      >
        {i18n.t('settings:potato_pc_mode.title')}
        &nbsp; <FontAwesomeIcon icon={faToilet} />
      </Title>
      <DiscordRpc
        css={`
          margin-bottom: 30px;
        `}
      >
        <p
          css={`
            width: 500px;
          `}
        >
          {i18n.t('settings:potato_pc_mode.description')}
        </p>
        <Switch
          onChange={e => {
            dispatch(updatePotatoPcMode(e));
          }}
          checked={potatoPcMode}
        />
      </DiscordRpc>
      <Hr />
      <Title
        css={`
          width: 300px;
          float: left;
        `}
      >
        {i18n.t('settings:clear_shared_data.title')}
        &nbsp; <FontAwesomeIcon icon={faTrash} />
      </Title>
      <div
        css={`
          display: flex;
          justify-content: space-between;
          text-align: left;
          width: 100%;
          margin-bottom: 30px;
          p {
            text-align: left;
            color: ${props => props.theme.palette.text.third};
          }
        `}
      >
        <p
          css={`
            margin: 0;
            width: 500px;
          `}
        >
          {i18n.t('settings:clear_shared_data.description')}
        </p>
        <Button
          onClick={() => {
            dispatch(
              openModal('ActionConfirmation', {
                message: 'Are you sure you want to delete shared data?',
                confirmCallback: clearSharedData,
                title: 'Confirm'
              })
            );
          }}
          disabled={disableInstancesActions}
          loading={deletingInstances}
        >
          Clear
        </Button>
      </div>
      <Hr />
      {/* {process.env.REACT_APP_RELEASE_TYPE === 'setup' && ( */}
      <CustomDataPathContainer>
        <Title
          css={`
            width: 400px;
            float: left;
          `}
        >
          {i18n.t('settings:user_data_path.title')}
          &nbsp; <FontAwesomeIcon icon={faFolder} />
          <a
            css={`
              margin-left: 30px;
            `}
            onClick={async () => {
              const appData = await ipcRenderer.invoke('getAppdataPath');
              const appDataPath = path.join(appData, 'gdlauncher_next');
              setDataPath(appDataPath);
            }}
          >
            {i18n.t('settings:user_data_path.reset')}
          </a>
        </Title>
        <div
          css={`
            display: flex;
            justify-content: space-between;
            text-align: left;
            width: 100%;
            height: 30px;
            margin: 20px 0 10px 0;
            p {
              text-align: left;
              color: ${props => props.theme.palette.text.third};
            }
          `}
        >
          <Input
            value={dataPath}
            onChange={e => setDataPath(e.target.value)}
            disabled={
              loadingMoveUserData ||
              deletingInstances ||
              disableInstancesActions
            }
          />
          <Button
            css={`
              margin-left: 20px;
            `}
            onClick={openFolder}
            disabled={loadingMoveUserData || deletingInstances}
          >
            <FontAwesomeIcon icon={faFolder} />
          </Button>
          <Button
            css={`
              margin-left: 20px;
            `}
            onClick={changeDataPath}
            disabled={
              disableInstancesActions ||
              userData === dataPath ||
              !dataPath ||
              dataPath.length === 0 ||
              deletingInstances
            }
            loading={loadingMoveUserData}
          >
            {i18n.t('settings:user_data_path.appry_and_restart')}
          </Button>
        </div>
        <div
          css={`
            display: flex;
            justify-content: flex-start;
            width: 100%;
          `}
        >
          <Checkbox
            onChange={e => {
              setMoveUserData(e.target.checked);
            }}
          >
            {i18n.t('settings:user_data_path.copy_current_data')}
          </Checkbox>
        </div>
      </CustomDataPathContainer>
      {/* )} */}
      <Hr />
      <LauncherVersion>
        <div
          css={`
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin: 10px 0;
          `}
        >
          <HorizontalLogo
            size={200}
            onClick={() => dispatch(openModal('ChangeLogs'))}
          />{' '}
          <div
            css={`
              margin-left: 10px;
            `}
          >
            v {version}
          </div>
        </div>
        <p>
          {updateAvailable
            ? i18n.t('settings:update.update_avaliable_message')
            : i18n.t('settings:update.up_to_date_message')}
        </p>
        <div
          css={`
            margin-top: 20px;
            height: 36px;
            display: flex;
            flex-direction: row;
          `}
        >
          {updateAvailable ? (
            <Button
              onClick={() =>
                ipcRenderer.invoke('installUpdateAndQuitOrRestart')
              }
              css={`
                margin-right: 10px;
              `}
              type="primary"
            >
              {i18n.t('settings:update.update_button_label')}
              &nbsp;
              <FontAwesomeIcon icon={faDownload} />
            </Button>
          ) : (
            <div
              css={`
                width: 96px;
                height: 36px;
                padding: 6px 8px;
              `}
            >
              {i18n.t('settings:update.up_to_date_label')}
            </div>
          )}
        </div>
      </LauncherVersion>
    </MyAccountPrf>
  );
};

export default memo(General);
