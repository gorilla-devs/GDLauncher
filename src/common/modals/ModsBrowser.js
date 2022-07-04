/* eslint-disable no-nested-ternary */
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { Radio } from 'antd';
import Modal from '../components/Modal';
import { CURSEFORGE, MODRINTH } from '../utils/constants';
import CurseForgeModsBrowser from './CurseForgeModsBrowser';
import ModrinthModsBrowser from './ModrinthModsBrowser';
import curseForgeIcon from '../assets/curseforgeIcon.webp';
import modrinthIcon from '../assets/modrinthIcon.webp';

const ModsBrowser = ({ instanceName, gameVersions }) => {
  const [modSource, setModSource] = useState(CURSEFORGE);

  return (
    <Modal
      css={`
        height: 85%;
        width: 90%;
        max-width: 1500px;
      `}
      title="Mods Browser"
    >
      <Container>
        <Header>
          <Radio.Group
            defaultValue={CURSEFORGE}
            onChange={e => setModSource(e.target.value)}
          >
            <Radio.Button value={CURSEFORGE}>
              <img
                src={curseForgeIcon}
                alt="CurseForge"
                css={`
                  margin-right: 4px;
                  cursor: pointer;
                  width: 20px;
                `}
              />
              CurseForge
            </Radio.Button>
            <Radio.Button value={MODRINTH}>
              <img
                src={modrinthIcon}
                alt="Modrinth"
                css={`
                  margin-right: 4px;
                  cursor: pointer;
                  width: 20px;
                `}
              />
              Modrinth
            </Radio.Button>
          </Radio.Group>
        </Header>

        {modSource === CURSEFORGE ? (
          <CurseForgeModsBrowser
            instanceName={instanceName}
            gameVersions={gameVersions}
          />
        ) : modSource === MODRINTH ? (
          <ModrinthModsBrowser
            instanceName={instanceName}
            gameVersion={gameVersions}
          />
        ) : null}
      </Container>
    </Modal>
  );
};

export default memo(ModsBrowser);

const Container = styled.div`
  height: 100%;
  width: 100%;
`;

const Header = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;
