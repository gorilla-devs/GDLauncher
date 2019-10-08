import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Select, Button } from 'ui';
import logo from '../../../../../../GDLauncher/app/assets/images/logo.png';

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

const HR = styled.hr`
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
  t {
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
  logoVersion {
    margin-left: -5px;
  }
  buttons {
    position: absolute;
    margin-top: 120px;
  }
`;

export default function MyAccountPreferences() {
  const [selectedInputValue, setSelectedInputValue] = useState('');
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
              paoloPaolino <FontAwesomeIcon icon={faCopy} />
            </Username>
          </UsernameContainer>
          <EmailContainer>
            Email
            <br />
            <Email>
              paoloPaolini@gmail.com <FontAwesomeIcon icon={faCopy} />
            </Email>
          </EmailContainer>
        </PersonalDataContainer>
      </PersonalData>
      <HR />
      <Title>Preferences</Title>
      <ReleaseChannel>
        <t>Release Channel</t>
        <div>
          Stable updates once a month, beta does update more often but it may
          have more bugs.
          <Select
            css={`
              position: absolute;
              top: 250px;
              right: 0px;
            `}
            onChange={e => setSelectedInputValue(e.target.value)}
            value={selectedInputValue}
            // input={<BootstrapInput name="age" id="age-customized-select" />}
          >
            <option value="" />
            <option value={10}>Ten</option>
            <option value={20}>Twenty</option>
            <option value={30}>Thirty</option>
          </Select>
        </div>
      </ReleaseChannel>
      <LauncherVersion>
        <div
          css={`
            height: 50px;
            width: 350px;
            margin: 0;
          `}
        >
          <logoVersion>
            <img
              src={logo}
              css={`
                height: 40px;
              `}
            />
            <h1
              css={`
                margin: 0;
                float: right;
                margin-left: -100px;
              `}
            >
              GDLauncher V 0.14.0
            </h1>
          </logoVersion>
          <p>
            You’re currently on the latest version. We automatically check for
            updates and we will inform you whenever there is one
          </p>
        </div>
        <buttons>
          <Button>
            Update &nbsp;
            <FontAwesomeIcon icon={faDownload} />
          </Button>
          <Button>Restart</Button>
        </buttons>
      </LauncherVersion>
    </MyAccountPrf>
  );
}
