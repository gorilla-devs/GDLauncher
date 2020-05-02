import React from 'react';
import path from 'path';
import { Button, Input } from 'antd';
import ContinueButton from './ContinueButton';

export default function FirstStep({
  filePath,
  showFileDialog,
  setPackVersion,
  packVersion,
  setPage,
  packAuthor,
  setPackAuthor,
  packZipName,
  setPackZipName
}) {
  return (
    <div
      css={`
        height: 85%;
        width: 100%;
        padding: 20px;
        overflow-y: auto;
      `}
    >
      <div
        css={`
          display: flex;
          justify-content: center;
          width: 100%;
          height: 100%;
          align-items: center;
          text-align: center;
        `}
      >
        <div>
          <div>
            <h2>Pack Author Name</h2>
            <div>
              <Input
                type="text"
                name="inputPackAuthor"
                defaultValue={packAuthor}
                // placeholder="Pack Author"
                allowClear="true"
                css={`
                  width: 200px;
                `}
                onChange={e => setPackAuthor(e.target.value)}
              />
            </div>
          </div>
          <div>
            <h2>Export / Pack Name</h2>
            <div>
              <Input
                type="text"
                name="inputPackAuthor"
                allowClear="true"
                defaultValue={packZipName}
                // placeholder="Pack Name"
                css={`
                  width: 200px;
                `}
                onChange={e => setPackZipName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <h2>Export Version Number</h2>
            <div>
              <Input
                type="text"
                name="inputPackVersion"
                defaultValue={packVersion}
                // placeholder="Major.Minor.Patch"
                allowClear="true"
                css={`
                  width: 200px;
                `}
                onChange={e => setPackVersion(e.target.value)}
              />
            </div>
          </div>
          <div>
            <h2>Resulting File name</h2>
            <div>
              <h3>
                {packZipName && packVersion
                  ? `${packZipName}-${packVersion}.zip`
                  : 'Invalid'}
              </h3>
            </div>
          </div>

          <h2>Destination folder for export</h2>
          <Button type="primary" onClick={showFileDialog}>
            {
              // eslint-disable-next-line no-nested-ternary
              !filePath
                ? 'Select Folder'
                : path.basename(filePath).length >= 24
                ? `${path.basename(filePath).substr(0, 24)}...`
                : path.basename(filePath)
            }
          </Button>
        </div>
      </div>
      <ContinueButton
        onClick={setPage}
        disabled={!(packZipName && packVersion && packAuthor && filePath)}
      />
    </div>
  );
}
