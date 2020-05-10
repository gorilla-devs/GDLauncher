import React from 'react';
import { Tree } from 'antd';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import BackButton from './BackButton';
import ContinueButton from './ContinueButton';

export default function SecondStep({
  setSelectedFiles,
  setPage,
  treeData,
  instancePath,
  selectedFiles,
  inProp,
  page
}) {
  const onCheck = LcheckedKeys => {
    setSelectedFiles(LcheckedKeys);
  };
  const computeTranslate = state => {
    if (page === 0 || !page) {
      if (state === 'exiting' || state === 'exited') {
        return 100;
      }
      return 0;
    }
    if (state === 'exiting' || state === 'exited') {
      return -100;
    }
    return 0;
  };

  return (
    <Transition in={inProp} timeout={200}>
      {state => (
        <Animation state={state} computeTranslate={computeTranslate}>
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
                  text-align: center;
                  height: calc(100% - 40px);
                `}
              >
                <h2>Files to include in export</h2>
                <div
                  css={`
                    overflow-y: auto;
                    height: calc(100% - 45px);
                    border-style: solid;
                    border-width: 2px;
                    border-color: ${props => props.theme.palette.primary.dark};
                    background-color: ${props => props.theme.palette.grey[800]};
                  `}
                >
                  {treeData.length && (
                    <Tree
                      checkable
                      selectable
                      onCheck={onCheck}
                      treeData={treeData}
                      defaultExpandedKeys={[instancePath]}
                      defaultCheckedKeys={selectedFiles}
                    />
                  )}
                </div>
                <BackButton onClick={setPage} />
                <ContinueButton onClick={setPage} />
              </div>
            </div>
          </div>
        </Animation>
      )}
    </Transition>
  );
}

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
    ${({ state, computeTranslate }) => computeTranslate(state)}%
  );
`;
