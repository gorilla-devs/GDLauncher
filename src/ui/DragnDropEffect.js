import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import path from 'path';
import pMap from 'p-map';
import fse from 'fs-extra';
import { Transition } from 'react-transition-group';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled, { keyframes } from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';

const DragEnterEffect = styled.div`
  position: absolute;
  display: flex;
  flex-direction; column;
  justify-content: center;
  align-items: center;
  border: solid 5px ${props => props.theme.palette.primary.main};
  transition: opacity 0.2s ease-in-out;
  border-radius: 3px;
  width: 100%;
  height: 100%;
  margin-top: 3px;
  z-index: ${props =>
    props.transitionState !== 'entering' && props.transitionState !== 'entered'
      ? -1
      : 2};
  backdrop-filter: blur(4px);
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, .3) 40%,
    rgba(0, 0, 0, .3) 40%
  );
  opacity: ${({ transitionState }) =>
    transitionState === 'entering' || transitionState === 'entered' ? 1 : 0};
`;

const keyFrameMoveUpDown = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }

`;

const DragArrow = styled(FontAwesomeIcon)`
  ${props =>
    props.fileDrag ? props.theme.palette.primary.main : 'transparent'};

  color: ${props => props.theme.palette.primary.main};

  animation: ${keyFrameMoveUpDown} 1.5s linear infinite;
`;

const CopyTitle = styled.h1`
  font-weight: bold;
  ${props =>
    props.fileDrag ? props.theme.palette.primary.main : 'transparent'};

  color: ${props => props.theme.palette.primary.main};
  animation: ${keyFrameMoveUpDown} 1.5s linear infinite;
`;

const antIcon = (
  <LoadingOutlined
    css={`
      font-size: 24px;
    `}
    spin
  />
);

const DragnDropEffect = ({
  instancesPath,
  instanceName,
  fileList,
  children
}) => {
  const [fileDrag, setFileDrag] = useState(false);
  const [fileDrop, setFileDrop] = useState(false);
  const [numOfDraggedFiles, setNumOfDraggedFiles] = useState(0);
  const [dragCompleted, setDragCompleted] = useState({});
  const [dragCompletedPopulated, setDragCompletedPopulated] = useState(false);

  const onDragOver = e => {
    setFileDrag(true);
    e.preventDefault();
  };

  const onDrop = async e => {
    setFileDrop(true);
    const dragComp = {};
    const { files } = e.dataTransfer;
    const arrTypes = Object.values(files).map(file => {
      const fileName = file.name;
      const fileType = path.extname(fileName);
      return fileType;
    });

    await pMap(
      Object.values(files),
      async file => {
        const fileName = file.name;
        const fileType = path.extname(fileName);

        dragComp[fileName] = false;

        setNumOfDraggedFiles(files.length);

        const { path: filePath } = file;

        if (fileList && fileList?.includes(fileName)) {
          console.error(
            'A resourcepack with this name already exists in the instance.',
            file.name
          );
          setFileDrop(false);
          setFileDrag(false);
        } else if (Object.values(files).length === 1) {
          if (
            fileType === '.zip' ||
            fileType === '.7z' ||
            fileType === '.disabled'
          ) {
            await fse.copy(
              filePath,
              path.join(instancesPath, instanceName, 'resourcepacks', fileName)
            );
            dragComp[fileName] = true;
            setFileDrop(false);
          } else {
            console.error('This file is not a zip');
            setFileDrop(false);
            setFileDrag(false);
          }
        } else {
          /* eslint-disable */
          if (arrTypes.includes('7z') || arrTypes.includes('zip')) {
            if (fileType === 'zip' || fileType === '7z') {
              await fse.copy(
                filePath,
                path.join(
                  instancesPath,
                  instanceName,
                  'resourcepacks',
                  fileName
                )
              );
              dragComp[fileName] = true;
            } else {
              setFileDrop(false);
              setFileDrag(false);
            }
          } else {
            console.error('The files are  not a zips!');
            setFileDrop(false);
            setFileDrag(false);
          }
        }
      },
      { concurrency: 10 }
    );
    setDragCompletedPopulated(files.length === Object.values(dragComp).length);
    setDragCompleted(dragComp);
  };

  const onDragEnter = e => {
    setFileDrag(true);
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = () => {
    setFileDrag(false);
  };

  useEffect(() => {
    if (dragCompletedPopulated) {
      const AllFilesAreCompleted = Object.keys(dragCompleted).every(x =>
        fileList.find(y => y === x)
      );

      setNumOfDraggedFiles(numOfDraggedFiles - 1);

      if (AllFilesAreCompleted) {
        setFileDrop(false);
        setFileDrag(false);
      }
    }
  }, [dragCompleted, fileList]);

  return (
    <>
      <div
        onDragEnter={onDragEnter}
        css={`
          width: 100%;
          height: calc(100% - 40px);
        `}
      >
        <Transition timeout={300} in={fileDrag}>
          {transitionState => (
            <DragEnterEffect
              onDrop={onDrop}
              transitionState={transitionState}
              onDragLeave={onDragLeave}
              fileDrag={fileDrag}
              onDragOver={onDragOver}
            >
              {fileDrop ? (
                <Spin
                  indicator={antIcon}
                  css={`
                    width: 30px;
                  `}
                >
                  {numOfDraggedFiles > 0 ? numOfDraggedFiles : 1}
                </Spin>
              ) : (
                <div
                  css={`
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                  `}
                  onDragLeave={e => e.stopPropagation()}
                >
                  <CopyTitle>Copy</CopyTitle>
                  <DragArrow icon={faArrowDown} size="3x" />
                </div>
              )}
            </DragEnterEffect>
          )}
        </Transition>
        {children}
      </div>
    </>
  );
};

export default DragnDropEffect;
