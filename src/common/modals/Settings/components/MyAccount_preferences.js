import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ipcRenderer, clipboard } from "electron";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { push } from "connected-react-router";
import { faCopy, faDownload } from "@fortawesome/free-solid-svg-icons";
import { Select, Tooltip, Button } from "antd";
import logo from "../../../assets/logo.png";
import { _getCurrentAccount } from "../../../utils/selectors";
import { updateReleaseChannel } from "../../../reducers/settings/actions";

const { app } = require("electron").remote;

const MyAccountPrf = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const PersonalData = styled.div`
  margin-top: 38px;
  width: 100%;
  height: 120px;
`;

const Title = styled.div`
  position: absolute;
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.primary};
  z-index: 1;
`;

const ProfileImage = styled.div`
  border-radius: 50%;
  background: #212b36;
  width: 50px;
  height: 50px;
  margin: 10px 0px 0px 10px;
`;
const UsernameContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 70px;
  display: inline-block;
  text-align: left;
`;

const EmailContainer = styled.div`
  position: absolute;
  top: 50px;
  left: 70px;
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
  margin: 20px 0px 0px 0;
  position: absolute;
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
  margin-top: 50px;
  width: 400px;
  height: 100px;
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
  margin-top: 10px;
  width: 100%;
  height: 70px;
  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
  }
`;

const LauncherVersion = styled.div`
  margin-top: 30px;
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

  const [releaseChannel, setReleaseChannel] = useState(0);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [concurrentDownloads, setConcurrentDownloads] = useState(1);

  const dispatch = useDispatch();

  useEffect(() => {
    setReleaseChannel(releaseC);
    ipcRenderer.send("check-for-updates");
    ipcRenderer.on("update-available", () => {
      setUpdateAvailable(true);
    });
  }, []);

  return (
    <MyAccountPrf>
      <PersonalData>
        <Title>My Account Preferences</Title>
        <PersonalDataContainer>
          <ProfileImage />
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
              <Tooltip title={copiedEmail ? "copied" : "copy"} placement="top">
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
        </PersonalDataContainer>
      </PersonalData>
      <Hr />
      <Title>Preferences</Title>
      <ReleaseChannel>
        <p>Release Channel</p>
        <div>
          Stable updates once a month, beta does update more often but it may
          have more bugs.
          <Select
            css={`
              margin-top: 250px;
              float: right;
            `}
            onChange={e => dispatch(updateReleaseChannel(e.target.value))}
            value={releaseChannel}
            defaultValue={releaseChannel}
          >
            <option value="1">Beta</option>
            <option value="0">Stable</option>
          </Select>
        </div>
      </ReleaseChannel>
      <Hr />
      <ParallelDownload>
        <Title
          css={`
            margin-top: 0px;
          `}
        >
          Concurrent Downloads
        </Title>
        <p
          css={`
            margin-top: 25px;
            width: 200px;
            position: absolute;
            left: 0;
          `}
        >
          Select the number of concurrent downloads
        </p>

        <Select
          css={`
            margin-left: 219px !important;
            margin-top: 20px !important;
          `}
          onChange={e => setConcurrentDownloads(e.target.value)}
          value={concurrentDownloads}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </Select>
      </ParallelDownload>
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
            onClick={() => {
              app.relaunch();
              app.exit(0);
            }}
          >
            Restart
          </StyledButtons>
        </div>
      </LauncherVersion>
    </MyAccountPrf>
  );
}
