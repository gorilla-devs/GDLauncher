/* eslint-disable */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Transition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLongArrowAltRight,
  faArchive
} from '@fortawesome/free-solid-svg-icons';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin, Radio } from 'antd';
import TwitchModpacks from './TwitchModpacks';
import EmptyInstance from './EmptyInstance';
import minecraftIcon from 'src/common/assets/minecraftIcon.png';
import twitchIcon from 'src/common/assets/twitchIcon.webp';

const Content = ({ in: inProp, setStep, page, setPage }) => {
  let pages = [<EmptyInstance />, <TwitchModpacks />];

  return (
    <Transition in={inProp} timeout={200}>
      {state => (
        <Animation state={state}>
          <div
            css={`
              width: 100%;
              height: calc(100% - 40px);
              display: flex;
              margin: 20px;
            `}
          >
            <div
              css={`
                flex: 5;
                height: 100%;
              `}
            >
              <div
                css={`
                  display: flex;
                  justify-content: center;
                  margin-bottom: 20px;
                `}
              >
                <Radio.Group
                  defaultValue={page}
                  onChange={e => setPage(e.target.value)}
                >
                  <Radio.Button value={0}>
                    <img
                      src={minecraftIcon}
                      width="22px"
                      css={`
                        margin-right: 4px;
                        cursor: pointer;
                      `}
                    />
                    Vanilla
                  </Radio.Button>
                  <Radio.Button value={1}>
                    <img
                      src={twitchIcon}
                      width="18px"
                      css={`
                        margin-right: 4px;
                        cursor: pointer;
                      `}
                    />
                    Twitch
                  </Radio.Button>
                  {/* <Radio.Button value={3} disabled>ATLauncher</Radio.Button>
                  <Radio.Button value={4} disabled>Technic</Radio.Button>
                  <Radio.Button value={4} disabled>FTB</Radio.Button> */}
                  {/* <Radio.Button value={2}>
                    <FontAwesomeIcon
                      icon={faArchive}
                      css={`
                        margin-right: 4px;
                        cursor: pointer;
                      `}
                    />
                    Import Zip
                  </Radio.Button> */}
                </Radio.Group>
              </div>
              <div
                css={`
                  height: calc(100% - 50px);
                `}
              >
                {pages[page]}
              </div>
            </div>
          </div>
        </Animation>
      )}
    </Transition>
  );
};

export default React.memo(Content);

const Animation = styled.div`
  transition: 0.2s ease-in-out;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100000;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === 'exiting' || state === 'exited' ? -100 : 0)}%
  );
`;
