import React from 'react';
import Modal from '../components/Modal';

const CfModDownloadFailed = ({ instanceName, failedModDownloads }) => {
  return (
    <Modal
      css={`
        width: 50%;
        max-width: 550px;
        overflow-x: hidden;
      `}
      title={`${failedModDownloads.length} Mods Failed to Download`}
    >
      <div>
        The following mods failed to download while setting up {instanceName}
        <div
          css={`
            background: ${props => props.theme.palette.grey[900]};
            padding: 10px;
            margin: 10px 0;
          `}
        >
          {failedModDownloads
            .map(x => x.fileName)
            .map(x => (
              <div>{x}</div>
            ))}
        </div>
        <div>
          You will need to download these from{' '}
          <a
            css={`
              color: ${props => {
                console.log(props);
                return props.theme.palette.colors.orange;
              }};
            `}
            href="https://www.curseforge.com/minecraft/mc-mods"
          >
            CurseForge
          </a>{' '}
          and install them manually.
        </div>
      </div>
    </Modal>
  );
};

export default CfModDownloadFailed;
