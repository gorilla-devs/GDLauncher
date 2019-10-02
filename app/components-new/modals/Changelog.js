import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { updateShowChangelog } from 'reducers/settings/actions';
import store from '../../localStore';
import Modal from 'components/common/Modal';

const Container = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
`;

const HrText = styled.h2`
  overflow: hidden;
  text-align: center;
  width: 100%;
  font-weight: bold;
  &:before,
  &:after {
    content: '';
    display: inline-block;
    height: 1px;
    position: relative;
    vertical-align: middle;
    width: 50%;
  }

  &:before {
    right: 0.5em;
    margin-left: -50%;
  }

  &:after {
    left: 0.5em;
    margin-right: -50%;
  }
`;

const HrTextGreen = styled(HrText)`
  color: ${({ theme }) => theme.green};
  &:before,
  &:after {
    background-color: ${({ theme }) => theme.green};
  }
`;

const HrTextRed = styled(HrText)`
  color: ${({ theme }) => theme.red};
  &:before,
  &:after {
    background-color: ${({ theme }) => theme.red};
  }
`;

const HrTextYellow = styled(HrText)`
  color: ${({ theme }) => theme.yellow};
  &:before,
  &:after {
    background-color: ${({ theme }) => theme.yellow};
  }
`;

const HrTextBlue = styled(HrText)`
  color: ${({ theme }) => theme.blue};
  &:before,
  &:after {
    background-color: ${({ theme }) => theme.blue};
  }
`;

const SubHrList = styled.div`
  text-align: left;
  li {
    font-size: 18px;
    margin: 15px 0;
  }
`;

const Summary = styled.span`
  font-size: 18px;
  color: white;
`;

const DiscordImage = styled.img`
  width: 200px;
  margin: 30px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-radius: 2px;
  padding: 3px;
  &:hover {
    background-color: #7289da;
  }
`;

const ChangelogRow = props => (
  <li>
    <Summary>{props.main}</Summary> {props.secondary}
  </li>
);

export default props => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(updateShowChangelog(false));
  }, []);

  const openDiscord = () => {
    require('electron').shell.openExternal('https://discord.gg/ZxRxPqn');
  };

  return (
    <Modal
      title={`WHAT'S NEW IN v${require('../../../package.json').version}`}
      height="70vh"
      width="600px"
    >
      <Container>
        <HrTextYellow
          css={`
            margin-top: 0;
          `}
        >
          WARNING!
        </HrTextYellow>
        <Summary>
          This update contains{' '}
          <span
            css={`
              color: ${({ theme }) => theme.yellow};
            `}
          >
            breaking changes
          </span>
          . If your instances don't run, try right-clicking on them and select
          "Repair"
        </Summary>
        <div style={{ margin: 15 }} />
        <HrTextGreen>SOME COOL NEW STUFF</HrTextGreen>
        <SubHrList>
          <ul>
            <ChangelogRow
              main="Added a crash handler"
              secondary=" when things go wrong xD"
            />
            <ChangelogRow
              main="Added java memory override for instances"
              secondary=" yeeee"
            />
            <ChangelogRow
              main="Added java arguments override for instances"
              secondary=" yeeee"
            />
            <ChangelogRow
              main="Added support for Minecraft Forge 1.13"
              secondary=". Don't tilt if it looks like it's frozen, it may take a while"
            />
            <ChangelogRow
              main="Added support for custom path for instances"
              secondary=". After changing it, you'll need to restart the launcher"
            />
            <ChangelogRow
              main="When importing a zip, a default name is suggested"
              secondary=". You'll have more time to play now!!"
            />
          </ul>
        </SubHrList>
        <HrTextRed>SOME BUGFIXES</HrTextRed>
        <SubHrList>
          <ul>
            <ChangelogRow
              main="Fixed download progress bar zindex"
              secondary=" lel"
            />
            <ChangelogRow
              main="Some improvements in the mods manager"
              secondary=", we're still working on it though"
            />
            <ChangelogRow
              main="The mods counter now shows the correct number of installed mods"
              secondary=", ouga buga"
            />
            <ChangelogRow
              main="Finally fixed the login token!!"
              secondary=", you won't need to login every time ever again :)"
            />
            <ChangelogRow
              main="Even though you don't see them"
              secondary=", we fixed and improved a lot of under-the-hood stuff. Enjoyy!"
            />
          </ul>
        </SubHrList>
        <HrTextBlue>WE LOVE YOU</HrTextBlue>
        <Summary>
          We love our users, that's why we have a dedicated discord server just
          to talk with all of them :)
        </Summary>
        <br />
        <DiscordImage
          src="https://discordapp.com/assets/192cb9459cbc0f9e73e2591b700f1857.svg"
          onClick={openDiscord}
        />
      </Container>
    </Modal>
  );
};
