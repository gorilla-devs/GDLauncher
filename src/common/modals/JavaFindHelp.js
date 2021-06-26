/* eslint-disable react/no-unescaped-entities */
import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Container } from './ChangeLogs';
import Modal from '../components/Modal';
import { reopenModal } from '../reducers/modals/actions';

const JavaFindHelp = (props = {}) => {
  const platform = props.platform ? props.platform : process.platform;
  const translateOS = os => {
    const table = [
      { platform: 'win32', name: 'Windows' },
      { platform: 'darwin', name: 'MacOS' },
      { platform: 'linux', name: 'Linux' }
    ];
    const found = table.find(item => item.platform === os);
    return found ? found.name : os;
  };
  const osName = translateOS(platform);
  const dispatch = useDispatch();

  return (
    <Modal
      css={`
        height: auto;
        width: 650px;
      `}
      title="How to find my java executable?"
    >
      <Container>
        <OSList>
          {['win32', 'darwin', 'linux'].map((item, index) => {
            return (
              <a
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                onClick={() =>
                  dispatch(reopenModal('JavaFindHelp', { platform: item }))
                }
                css={`
                  margin: 0 6%;
                  padding: 5px 10px;
                  border-radius: 5px;
                  ${item === platform
                    ? 'color: #E1E2E4;' +
                      'background-color: #365076;' +
                      '&:hover {color: #a9b0bd;}'
                    : ''}
                `}
              >
                {translateOS(item)}
              </a>
            );
          })}
        </OSList>
        <Section>
          <SectionTitle>
            <span>On {osName}</span>
          </SectionTitle>

          <GetOSHelp platform={platform} />

          <br />
          <p
            css={`
              height: 20px;
            `}
          >
            Still problems? Contact us{' '}
            <a href="https://discord.gg/4cGYzen">on Discord</a> or create an
            issue{' '}
            <a href="https://github.com/gorilla-devs/GDLauncher/issues/">
              on Github
            </a>
          </p>
        </Section>
      </Container>
    </Modal>
  );
};

export default memo(JavaFindHelp);

const GetOSHelp = (props = {}) => {
  const dispatch = useDispatch();
  if (props.platform === 'win32') return <Win32Help />;
  if (props.platform === 'darwin') return <MacOSHelp />;
  if (props.platform === 'linux') return <LinuxHelp />;
  return (
    <HelpSection>
      We´re sorry, but we could not find out you Operating System. You are
      probably running a unknown Linux Distribution, so it would be best to try{' '}
      <a
        onClick={() =>
          dispatch(reopenModal('JavaFindHelp', { platform: 'linux' }))
        }
      >
        Linux help
      </a>
      .
    </HelpSection>
  );
};

const Win32Help = () => {
  return (
    <HelpSection>
      <b>How to find on Windows *placeholder*</b>
      Sadly, no one was found by now who wanted to write this text :(
      <br />
      If you want a text here, write a description how to find the java.exe file
      on Windows and send it to us.
    </HelpSection>
  );
};

const MacOSHelp = () => {
  return (
    <HelpSection>
      <li>
        <b>Option 1:</b>
        <br />
        Open your Terminal program, type in{' '}
        <code>/usr/libexec/java_home -v 1.8</code> and press enter. The feedback
        of the command is the java home directory. Navigate to this directory
        and open the folder "bin", there you´ll find the "java" executable.
      </li>
      <br />
      <li>
        <b>Option 2:</b>
        <br />
        The default path of your Java installation should be <br />
        <code
          css={`
            line-break: anywhere;
          `}
        >
          /Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Home/
        </code>{' '}
        navigate there in the Finder and open the folder "bin", there you´ll
        find the "java" executable.
      </li>
    </HelpSection>
  );
};

const LinuxHelp = () => {
  return (
    <HelpSection>
      <span>
        <i
          css={`
            color: #fff8;
          `}
        >
          *not tested
        </i>
        <br />
        Open your Terminal program, type in <code>echo %JAVA_HOME%</code> and
        press enter. The feedback of the command is the java home directory.
        Navigate to this directory and open the folder "bin", there you´ll find
        the "java" executable
        <br />
      </span>
      <br />
      <span>
        Not worked? No worries -{' '}
        <a href="https://java.com/en/download/help/path.html">This page</a>{' '}
        could help you
      </span>
    </HelpSection>
  );
};

const HelpSection = styled.div`
  text-align: left;

  code {
    background-color: #595959b0;
    border-radius: 5px;
    padding: 1px;
    font-size: 14px;
  }

  div {
    margin: 0;
    width: auto;
  }

  a {
    text-decoration: underline;
  }
`;

const OSList = styled.div`
  text-align: center;
  margin-bottom: 30px;
  margin-top: 5px;
`;

const SectionTitle = styled.h2`
  width: 100%;
  text-align: center;
  border-bottom: 1px solid;
  line-height: 0.1em;
  margin: 10px 0 20px;
  color: ${props => props.theme.palette.text.primary};

  span {
    background: ${props => props.theme.palette.secondary.main};
    padding: 0 10px;
  }
`;

const Section = styled.div`
  width: 100%;
  text-align: center;
  font-size: 16px;

  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    margin: 10px 0;
    border-radius: 5px;

    li {
      text-align: start;
    }
  }
`;
