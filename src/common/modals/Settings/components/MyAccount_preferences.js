import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ipcRenderer, clipboard } from "electron";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { push } from "connected-react-router";
import { faCopy, faDownload } from "@fortawesome/free-solid-svg-icons";
import { Select, Tooltip, Button, Switch } from "antd";
import logo from "../../../assets/logo.png";
import { _getCurrentAccount } from "../../../utils/selectors";
import {
  updateReleaseChannel,
  updateDiscordRPC
} from "../../../reducers/settings/actions";

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
  float: left;
`;

const ProfileImage = styled.div`
  position: relative;
  top: 10px;
  left: 10px;
  border-radius: 50%;
  background: #212b36;
  width: 50px;
  height: 50px;
`;
const UsernameContainer = styled.div`
  float: left;
  display: inline-block;
  text-align: left;
`;

const EmailContainer = styled.div`
  float: left;
  display: inline-block;
  text-align: left;
`;

const Username = styled.div`
  text-size: 5px;
  text-weight: 200;
  color: ${props => props.theme.palette.grey[100]};
`;

const Email = styled.div`
  text-size: 5px;
  text-weight: 200;
  color: ${props => props.theme.palette.grey[100]};
`;

const PersonalDataContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 476px;
  height: 100px;
  background: ${props => props.theme.palette.grey[900]};
  border-radius: ${props => props.theme.shape.borderRadius};
`;

const Hr = styled.hr`
  opacity: 0.29;
  background: ${props => props.theme.palette.secondary.light};
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
  margin: 30px 0 30px 0;
  height: 150px;
  p {
    text-align: left;
    float: left;
    color: ${props => props.theme.palette.text.third};
    margin: 0 0 0 6px;
  }

  h1 {
    color: ${props => props.theme.palette.text.primary};
  }
`;

function copy(setCopied, copy) {
  setCopied(true);
  clipboard.writeText(copy);
  setTimeout(() => {
    setCopied(false);
  }, 500);
}

const StyledButtons = styled(Button)``;

export default function MyAccountPreferences() {
  const currentAccount = useSelector(_getCurrentAccount);
  const releaseC = useSelector(state => state.settings.releaseChannel);
  const DiscordRPC = useSelector(state => state.settings.discordRPC);

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [concurrentDownloads, setConcurrentDownloads] = useState(1);

  const dispatch = useDispatch();

  useEffect(() => {
    ipcRenderer.send("check-for-updates");
    ipcRenderer.on("update-available", () => {
      setUpdateAvailable(true);
    });
  }, []);

  return (
    <MyAccountPrf>
      <PersonalData>
        <MainTitle>General</MainTitle>
        <PersonalDataContainer>
          <ProfileImage />
          <div
            css={`
              display: inline-block;
              margin-left: 20px;
              width: 250px;
            `}
          >
            <UsernameContainer>
              Username
              <br />
              <Username>
                {currentAccount.selectedProfile.name}{" "}
                <Tooltip
                  title={copiedUsername ? "copied" : "copy"}
                  placement="top"
                >
                  <div
                    css={`
                      width: 13px;
                      height: 14px;
                      margin: 0;
                      margin-left: 4px;
                      float: right;
                    `}
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      onClick={() =>
                        copy(
                          setCopiedUsername,
                          currentAccount.selectedProfile.name
                        )
                      }
                    />
                  </div>
                </Tooltip>
              </Username>
            </UsernameContainer>
            <EmailContainer>
              Email
              <br />
              <Email>
                {currentAccount.user.username}{" "}
                <Tooltip
                  title={copiedEmail ? "copied" : "copy"}
                  placement="top"
                >
                  <div
                    css={`
                      width: 13px;
                      height: 14px;
                      margin: 0;
                      margin-left: 4px;
                      float: right;
                    `}
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      onClick={() =>
                        copy(setCopiedEmail, currentAccount.user.username)
                      }
                    />
                  </div>
                </Tooltip>
              </Email>
            </EmailContainer>
          </div>
        </PersonalDataContainer>
      </PersonalData>
      <Hr />
      <Title
        css={`
          margin-bottom: 20px;
        `}
      >
        Preferences
      </Title>
      <ReleaseChannel>
        <h3>Release Channel</h3>
        <div>
          <div
            css={`
              width: 400px;
            `}
          >
            Stable updates once a month, beta does update more often but it may
            have more bugs.
          </div>
          <Select
            css={`
              position: relative;
              right: 0;
            `}
            onChange={e => {
              dispatch(updateReleaseChannel(e));
            }}
            value={releaseC}
            defaultValue={!releaseC ? "Stable" : "Beta"}
          >
            <Select.Option value="1">Beta</Select.Option>
            <Select.Option value="0">Stable</Select.Option>
          </Select>
        </div>
      </ReleaseChannel>
      <Hr />
      <Title
        css={`
          margin-top: 0px;
        `}
      >
        Concurrent Downloads
      </Title>
      <ParallelDownload>
        <p
          css={`
            margin: 0;
            width: 200px;
          `}
        >
          Select the number of concurrent downloads
        </p>

        <Select
          css={`
            position: relative;
            right: 0;
          `}
          onChange={e => setConcurrentDownloads(e)}
          value={concurrentDownloads}
        >
          <Select.Option value="1">1</Select.Option>
          <Select.Option value="2">2</Select.Option>
          <Select.Option value="3">3</Select.Option>
          <Select.Option value="4">4</Select.Option>
          <Select.Option value="5">5</Select.Option>
          <Select.Option value="6">6</Select.Option>
          <Select.Option value="7">7</Select.Option>
          <Select.Option value="8">8</Select.Option>
          <Select.Option value="9">9</Select.Option>
          <Select.Option value="10">10</Select.Option>
        </Select>
      </ParallelDownload>
      <Hr />
      <Title
        css={`
          margin-top: 0px;
        `}
      >
        Discord RPC
      </Title>
      <DiscordRpc>
        <p
          css={`
            margin: 0;
            height: 40px;
            width: 250px;
          `}
        >
          Enable or Disable Discord RPC
        </p>

        <Switch
          css={`
            position: relative;
            right: 0;
          `}
          color="primary"
          onChange={e => {
            dispatch(updateDiscordRPC(e));
            if (e) {
              ipcRenderer.invoke("init-discord-rpc");
            } else {
              ipcRenderer.invoke("shutdown-discord-rpc");
            }
          }}
          checked={DiscordRPC}
        />
      </DiscordRpc>
      <Hr />
      <LauncherVersion>
        <div
          css={`
            height: 50px;
            width: 350px;
            margin: 0;
          `}
        >
          <div
            css={`
              display: flex;
              flex-direction: row;
            `}
          >
            <img
              src={logo}
              css={`
                height: 40px;
              `}
              alt="logo"
            />
            <h1
              css={`
                line-height: 1.5;
                margin: 0;
              `}
            >
              GDLauncher V 0.14.0
            </h1>
          </div>
        </div>
        <p>
          You’re currently on the latest version. We automatically check for
          updates and we will inform you whenever there is one
        </p>
        <div
          css={`
            float: left;
            margin-top: 20px;
            height: 36px;
            display: flex;
            flex-direction: row;
          `}
        >
          {/* I've used the style instead of the css because the Button component doesn'p read css */}
          {updateAvailable ? (
            <StyledButtons
              onClick={() => dispatch(push("/autoUpdate"))}
              css={`
                margin-right: 10px;
              `}
              color="primary"
            >
              Update &nbsp;
              <FontAwesomeIcon icon={faDownload} />
            </StyledButtons>
          ) : (
            <div
              css={`
                width: 96px;
                height: 36px;
                padding: 6px 8px;
              `}
            >
              Up to date
            </div>
          )}
          <StyledButtons
            color="primary"
            onClick={() => ipcRenderer.invoke("appRestart")}
          >
            Restart
          </StyledButtons>
        </div>
      </LauncherVersion>
    </MyAccountPrf>
  );
}
