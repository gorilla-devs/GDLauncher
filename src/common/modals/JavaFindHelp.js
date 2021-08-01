import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import Modal from '../components/Modal';
import { reopenModal } from '../reducers/modals/actions';

const JavaFindHelp = ({ os }) => {
  const platform = os || process.platform;
  const translateOS = system => {
    const table = {
      win32: 'Windows',
      darwin: 'MacOS',
      linux: 'Linux'
    };
    return table[system];
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
                  dispatch(reopenModal('JavaFindHelp', { os: item }))
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

const GetOSHelp = ({ platform }) => {
  const dispatch = useDispatch();
  if (platform === 'win32') return <Win32Help />;
  if (platform === 'darwin') return <MacOSHelp />;
  if (platform === 'linux') return <LinuxHelp />;
  return (
    <HelpSection>
      We´re sorry, but we could not find out you Operating System. You are
      probably running a unknown Linux Distribution, so it would be best to try{' '}
      <a onClick={() => dispatch(reopenModal('JavaFindHelp', { os: 'linux' }))}>
        Linux help
      </a>
      .
    </HelpSection>
  );
};

const Win32Help = () => {
  return (
    <HelpSection>
      <span>
        Open your home menu by pressing the windows key and search for the
        program &quot;cmd&quot;. Open it, type in <code>echo %JAVA_HOME%</code>{' '}
        and press enter. This command should return the path to your default
        java home directory. If this doesn&apos;t work, try to find it manually
        in <code>C:\Program Files\Java\jdk...</code>. If the command works,
        paste the path in and add <code>\bin\java.exe</code> to it.
      </span>
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
        and open the folder &quot;bin&quot;, there you´ll find the
        &quot;java&quot; executable.
      </li>
      <br />
      <li>
        <b>Option 2:</b>
        <br />
        The default path of your included system Java installation should be{' '}
        <br />
        <code
          css={`
            line-break: anywhere;
          `}
        >
          /Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Home/
        </code>{' '}
        navigate there in the Finder and open the folder &quot;bin&quot;, there
        you´ll find the &quot;java&quot; executable.
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
        Navigate to this directory and open the folder &quot;bin&quot;, there
        you´ll find the &quot;java&quot; executable
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

const Container = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  overflow-y: auto;
  color: ${props => props.theme.palette.text.primary};
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
