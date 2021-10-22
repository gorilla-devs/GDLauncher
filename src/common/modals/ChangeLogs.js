/* eslint-disable react/no-unescaped-entities */
import React, { memo, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug, faStar, faWrench } from '@fortawesome/free-solid-svg-icons';
import { useInView } from 'react-intersection-observer';
import Modal from '../components/Modal';
import SocialButtons from '../components/SocialButtons';
import KoFiButton from '../assets/ko-fi.png';
import UpdateIllustration from '../assets/update_illustration.png';
import { openModal } from '../reducers/modals/actions';
import ga from '../utils/analytics';

const UpdateRow = ({ header, content, advanced }) => {
  const prSplit = advanced?.pr?.split('/');
  return (
    <li>
      &bull; {header}{' '}
      <span
        css={`
          color: ${props => props.theme.palette.text.third};
        `}
      >
        {content}
      </span>
      {advanced && (
        <>
          <div
            css={`
              color: ${props => props.theme.palette.text.third};
              font-size: 12px;
              a {
                color: ${props => props.theme.palette.primary.light};
              }
              a:hover {
                color: ${props => props.theme.palette.primary.main};
              }
            `}
          >
            <a
              href={`https://github.com/gorilla-devs/GDLauncher/commit/${advanced.cm}`}
            >
              {advanced.cm}
            </a>
            {prSplit && (
              <>
                {' | '}
                {/* Yes, this was the best (and shortest) version to do this I could come up with */}
                <a
                  href={`https://github.com/gorilla-devs/GDLauncher/pull/${
                    prSplit[0]
                  }${prSplit.length > 1 ? `/commits/${prSplit[1]}` : ''}`}
                >
                  #{advanced.pr}
                </a>
              </>
            )}
            {advanced.ms && <> | {advanced.ms}</>}
          </div>
        </>
      )}
    </li>
  );
};

const data = {
  new: [
    {
      header: 'Started rollout of custom APIs',
      content:
        'because CurseForge is planning to close their APIs in the future. ' +
        'These custom APIs are disabled at the moment.',
      advanced: { cm: '2b37e27a', ms: 'Noo CurseForge, why?' }
    },
    {
      header: 'Moved from Patreon to Ko-fi',
      content: 'as you can see above',
      advanced: { cm: 'a95c6e1c' }
    },
    {
      header: 'Added setting to use Symlinks',
      content: 'instead of absolute paths to fix issues whit to long paths',
      advanced: { cm: 'abe61b07' }
    },
    {
      header: 'Option to sort Instances',
      content: 'by selecting the preferred order in the settings. :D',
      advanced: { cm: 'dda24322', pr: '887' }
    },
    {
      header: 'Added option to open the export folder',
      content: 'after exporting an instance',
      advanced: { cm: 'e15d6548', pr: '1082' }
    }
  ],
  improvements: [
    {
      header: 'Added a "Check for updates" button',
      content: 'to release CurseForge from a lot of automated API requests',
      advanced: { cm: 'f12465f2' }
    },
    {
      header: 'Changed the buttons in the Mod Browser',
      content: 'to good looking icons',
      advanced: { cm: '399939a5', pr: '1035' }
    },
    {
      header: 'Updated Electron',
      content: 'and murmur2 dependencies to their latest versions.',
      advanced: { cm: 'f03d81b5', ms: 'Upgraded Electron to v15.1.0' }
    },
    {
      header: 'Batching multiple CurseForge requests together',
      content: 'to increase request performance',
      advanced: { cm: '422f9caf' }
    }
  ],
  bugfixes: [
    {
      header: 'Fixed 7zip not unzipping',
      content: 'the downloaded files.',
      advanced: {
        cm: '2240004d',
        ms:
          'You want to know the true story? He did this, then I told him ' +
          "that it doesn't work so he did it again and it partially worked. " +
          'Then, third time, he stole my working code and committed it! :o'
      }
    },
    {
      header: 'Fixed MacOS .DS_Store files',
      content: 'being detected as instances.',
      advanced: { cm: '7528e587', pr: '1045/511af67' }
    },
    {
      header: 'Fixed ModBrowser icons',
      content: 'not being sized correctly.',
      advanced: { cm: '7528e587', pr: '1045/9a35c56' }
    },
    {
      header: 'Corrected wrong spelled CSS code',
      content: 'which was inherited anyways.',
      advanced: { cm: '7528e587', pr: '1045' }
    },
    {
      header: 'Fixed console error on Beta channel',
      content: 'where release channel was undefined.',
      advanced: { cm: '7528e587', pr: '1045/d185730' }
    },
    {
      header: 'Fixed MacOS navbar logo',
      content: 'being a bit to far on the right',
      advanced: { cm: '5a245c99', pr: '1074' }
    },
    {
      header: 'Fixed beta releases on Portable',
      content: 'not downloading.',
      advanced: { cm: 'e32ee91f' }
    },
    {
      header: 'Hopefully fixed FTB downloads',
      content: 'failing because of invalid file hashes',
      advanced: {
        cm: '77988a42',
        ms:
          "In reality I don't really know what davide did there, I just " +
          'pretend to do so ;)'
      }
    },
    {
      header: 'Fixed mod file hash check',
      advanced: { cm: '5fd0deb4' }
    },
    {
      header: 'Fixed icons in .deb release',
      content: 'not showing up.',
      advanced: { cm: 'a7f1cb35', pr: '1039' }
    },
    {
      header: 'Fixed startup crash',
      content: 'only occurring in beta',
      advanced: { cm: '1cff7e08' }
    },
    {
      header: 'Fixed squashed Image',
      content: 'in the screenshots',
      advanced: { cm: '17e3f8b8', pr: '1074' }
    },
    {
      header: 'Fixed crash',
      content: 'when switching tabs too fast',
      advanced: {
        cm: '17e3f8b8',
        pr: '1074',
        ms: 'You will need a good mouse to experience that :)'
      }
    },
    {
      header: 'Fixed some wording and punctuation',
      content: 'in the settings',
      advanced: { cm: '248d8ae8', pr: '1080', ms: 'Good eye Huantian!' }
    },
    {
      header: 'Disabled symlink option for non-Windows',
      content: 'because it is not needed and not working there.',
      advanced: { cm: '7d8289b2', pr: '1097' }
    }
  ]
};

const ChangeLogs = () => {
  const [version, setVersion] = useState(null);
  const [skipIObserver, setSkipIObserver] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const dispatch = useDispatch();
  const { ref: intersectionObserverRef, inView: insectionObserverInView } =
    useInView({
      threshold: 0.3,
      initialInView: false,
      triggerOnce: true,
      skip: skipIObserver
    });

  useEffect(() => {
    ipcRenderer
      .invoke('getAppVersion')
      .then(v => {
        setVersion(v);
        if (!v.includes('beta')) {
          setTimeout(() => {
            setSkipIObserver(false);
          }, 300);
        }
        return v;
      })
      .catch(console.error);
    ga.sendCustomEvent('changelogModalOpen');
  }, []);

  useEffect(() => {
    if (insectionObserverInView) {
      ga.sendCustomEvent('changelogModalReadAll');
    }
  }, [insectionObserverInView]);

  const openBisectModal = () => {
    dispatch(openModal('BisectHosting'));
    ga.sendCustomEvent('changelogModalOpenBisect');
  };

  return (
    <Modal
      css={`
        height: 550px;
        width: 475px;
      `}
      title={`What's new in ${version}`}
      removePadding
    >
      <Container>
        <Header>
          <img
            css={`
              border-radius: 5px;
            `}
            src={UpdateIllustration}
            alt="New Version"
          />
          <div
            css={`
              margin-top: 20px;
              color: ${props => props.theme.palette.text.third};
              span {
                color: ${props => props.theme.palette.text.primary};
                cursor: pointer;
                text-decoration: underline;
              }
            `}
          >
            If you appreciate our work, please consider supporting us through a
            donation or grab a server from our official partner{' '}
            <span onClick={openBisectModal}>BisectHosting</span>
          </div>
          <div
            css={`
              display: flex;
              align-items: center;
              justify-content: start;
              margin-bottom: 20px;
              margin-top: 20px;
              a:nth-child(1) {
                margin-right: 20px;
              }
              img {
                border-radius: 30px;
                height: 40px;
                cursor: pointer;
                transition: transform 0.2s ease-in-out;
                &:hover {
                  transform: scale(1.05);
                }
              }
            `}
          >
            <a href="https://ko-fi.com/gdlauncher">
              <img src={KoFiButton} alt="Ko-Fi" />
            </a>
          </div>
          <a
            css={`
              margin-top: 20px;
              color: ${props => props.theme.palette.primary.light};
            `}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced
              ? 'Hide extended information'
              : 'Show extended information'}
          </a>
        </Header>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            <span
              css={`
                display: flex;
                align-items: center;
              `}
            >
              <FontAwesomeIcon
                icon={faStar}
                css={`
                  margin-right: 10px;
                  font-size: 20px;
                `}
              />
              New
            </span>
          </SectionTitle>
          <ul>
            {data.new.map((item, index) => (
              <UpdateRow
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                header={item.header}
                content={item.content}
                advanced={showAdvanced && item.advanced}
              />
            ))}
          </ul>
        </Section>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.yellow};
            `}
          >
            <span
              css={`
                display: flex;
                align-items: center;
              `}
            >
              <FontAwesomeIcon
                icon={faWrench}
                css={`
                  margin-right: 10px;
                  font-size: 20px;
                `}
              />
              Improved
            </span>
          </SectionTitle>
          <ul>
            {data.improvements.map((item, index) => (
              <UpdateRow
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                header={item.header}
                content={item.content}
                advanced={showAdvanced && item.advanced}
              />
            ))}
          </ul>
        </Section>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.red};
            `}
          >
            <span
              css={`
                display: flex;
                align-items: center;
              `}
            >
              <FontAwesomeIcon
                icon={faBug}
                css={`
                  margin-right: 10px;
                  font-size: 20px;
                `}
              />
              Bug Fixes
            </span>
          </SectionTitle>
          <ul ref={intersectionObserverRef}>
            {data.bugfixes.map((item, index) => (
              <UpdateRow
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                header={item.header}
                content={item.content}
                advanced={showAdvanced && item.advanced}
              />
            ))}
          </ul>
        </Section>
      </Container>
      <div
        css={`
          position: sticky;
          bottom: 0;
          height: 60px;
          width: 100%;
          background: ${props => props.theme.palette.grey[800]};
          border-radius: 4px;
          display: flex;
          align-items: center;
          padding: 0 20px;
        `}
      >
        <SocialButtons />
        <span
          css={`
            padding-left: 20px;
            color: ${props => props.theme.palette.text.secondary};
          `}
        >
          Follow us for more updates
        </span>
      </div>
    </Modal>
  );
};

export default memo(ChangeLogs);

const Container = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  overflow-y: auto;
  color: ${props => props.theme.palette.text.primary};
  padding: 20px;
`;

const SectionTitle = styled.h2`
  width: 100%;
  margin: 0;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 22px;
`;

const Section = styled.div`
  width: 100%;
  font-size: 16px;
  p {
    margin: 20px 0 !important;
  }
  ul {
    padding: 0px;
    list-style-position: inside;
    width: 100%;
    margin: 20px 0;
    border-radius: 5px;
  }

  li {
    text-align: start;
    list-style-type: none;
    margin: 10px 0;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;
`;
