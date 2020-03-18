/* eslint-disable */
import React, { useMemo } from "react";
import styled from "styled-components";
import { Transition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLongArrowAltLeft,
  faLongArrowAltRight
} from "@fortawesome/free-solid-svg-icons";
import { transparentize } from "polished";
import { Input } from "antd";
import TwitchModpacks from "./TwitchModpacks";
import Import from "./Import";
import NewInstance from "./NewInstance";

const Content = ({
  in: inProp,
  setStep,
  page,
  setPage,
  setVersion,
  version,
  setModpack,
  modpack,
  setImportZipPath,
  setOptifineVersion,
  optifineVersion
}) => {
  let pages = [
    <NewInstance
      setVersion={setVersion}
      version={version}
      setModpack={setModpack}
      setOptifineVersion={setOptifineVersion}
      optifineVersion={optifineVersion}
    />,
    <TwitchModpacks
      setVersion={setVersion}
      setStep={setStep}
      setModpack={setModpack}
    />,
    <Import
      setVersion={setVersion}
      setModpack={setModpack}
      modpack={modpack}
      setImportZipPath={setImportZipPath}
    />
  ];

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
              {pages[page]}
            </div>
            <div
              page={page}
              css={`
                position: absolute;
                bottom: 20px;
                right: 20px;
                opacity: ${props => (props.page === 0 ? 1 : 0)};
              `}
            >
              <div
                version={version}
                css={`
                  width: 70px;
                  height: 40px;
                  transition: 0.1s ease-in-out;
                  display: flex;
                  justify-content: center;
                  border-radius: 4px;
                  font-size: 40px;
                  color: ${props =>
                    props.version
                      ? props.theme.palette.text.icon
                      : props.theme.palette.text.disabled};
                  ${props => (props.version ? "cursor: pointer;" : "")}
                  &:hover {
                    background-color: ${props =>
                      props.version ? props.theme.action.hover : "transparent"};
                  }
                `}
                onClick={() => {
                  if (version) {
                    setStep(1);
                  }
                }}
              >
                <FontAwesomeIcon icon={faLongArrowAltRight} />
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
    ${({ state }) => (state === "exiting" || state === "exited" ? -100 : 0)}%
  );
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  color: white;
  border-radius: 4px;
  padding: 0 4px;
  cursor: pointer;
  ${props =>
    props.active ? `background: ${props.theme.palette.grey[500]};` : ""}
  transition: background 0.1s ease-in-out;
  &:hover {
    background: ${props => props.theme.palette.grey[500]};
  }
`;
