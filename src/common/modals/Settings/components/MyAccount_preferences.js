import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ipcRenderer, clipboard } from "electron";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { push } from "connected-react-router";
import { faCopy, faDownload } from "@fortawesome/free-solid-svg-icons";
import Select from "@material-ui/core/Select";
import Tooltip from "@material-ui/core/Tooltip";
import { Button, Slider } from "../../../../ui";
import logo from "../../../assets/logo.png";
import { _getCurrentAccount } from "../../../utils/selectors";
import { updateReleaseChannel } from "../../../reducers/settings/actions";

const { app } = require("electron").remote;

const MyAccountPrf = styled.div`
  width: 100%;
  height: 500px;
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
  color: ${props => props.theme.palette.text.main};
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
  display: flex;
  flex-direcyion: column;
  text-align: left;
  margin-top: 10px;
  width: 100%;
  height: 100px;

  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
  }
`;

const LauncherVersion = styled.div`
  margin-top: 30px;
  height: 150px;
  text-align: left;
  display: flex;
  display-directions: column;
  p {
    float: left;
    color: ${props => props.theme.palette.text.third};
    margin: 0 0 0 6px;
  }
`;

const StyledButtons = styled(Button)``;

export default function MyAccountPreferences() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);

  const currentAccount = useSelector(_getCurrentAccount);
  const releaseChannel = useSelector(state => state.settings.releaseChannel);
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
                    onClick={() => {
                      clipboard.writeText(currentAccount.selectedProfile.name);
                      setCopiedUsername(!copiedUsername);
                    }}
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
                    onClick={() => {
                      clipboard.writeText(currentAccount.user.username);
                      setCopiedEmail(!copiedEmail);
                    }}
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
              position: absolute;
              top: 250px;
              right: 0px;
            `}
            onChange={e => dispatch(updateReleaseChannel(e.target.value))}
            value={releaseChannel || 0}
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
        <Slider
          css={`
            margin-top: 70px;
            margin-bottom: 30px;
            width: 100%;
            word-break: break-word;
          `}
          defaultValue={1}
          min={1}
          max={10}
          valueLabelDisplay="auto"
        />
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
              margin-left: -5px;
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
                margin: 0;
                float: right;
                margin-left: 0px;
              `}
            >
              GDLauncher V 0.14.0
            </h1>
          </div>
          <p>
            You’re currently on the latest version. We automatically check for
            updates and we will inform you whenever there is one
          </p>
        </div>
        <div
          css={`
            position: absolute;
            margin-top: 120px;
          `}
        >
          {/* I've used the style instead of the css because the Button component doesn'p read css */}
          {updateAvailable ? (
            <StyledButtons
              onClick={() => dispatch(push("/autoUpdate"))}
              style={{ marginRight: "10px" }}
              color="primary"
            >
              Update &nbsp;
              <FontAwesomeIcon icon={faDownload} />
            </StyledButtons>
          ) : (
            <StyledButtons style={{ marginRight: "10px" }}>
              Up to date
            </StyledButtons>
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
