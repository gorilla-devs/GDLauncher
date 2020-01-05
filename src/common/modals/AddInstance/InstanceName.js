/* eslint-disable */
import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import path from "path";
import { useSelector, useDispatch } from "react-redux";
import { Transition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLongArrowAltLeft,
  faLongArrowAltRight
} from "@fortawesome/free-solid-svg-icons";
import { addToQueue } from "../../reducers/actions";
import { closeModal } from "../../reducers/modals/actions";
import { Input } from "antd";
import { getAddonFile } from "../../api";
import { downloadAddonZip } from "../../../app/desktop/utils";
import { _getInstancesPath } from "../../utils/selectors";
import { transparentize } from "polished";

const InstanceName = ({
  in: inProp,
  setStep,
  version,
  modpack,
  setVersion,
  setModpack
}) => {
  const dispatch = useDispatch();
  const instancesPath = useSelector(_getInstancesPath);
  const fabricManifest = useSelector(state => state.app.fabricManifest);
  const [instanceName, setInstanceName] = useState("");
  const [clicked, setClicked] = useState(false);

  const createInstance = async () => {
    if (!version || !instanceName) return;
    const isVanilla = version[0] === "vanilla";
    const isFabric = version[0] === "fabric";
    const isForge = version[0] === "forge";
    const isTwitchModpack = version[0] === "twitchModpack";
    if (isVanilla) {
      dispatch(addToQueue(instanceName, [version[0], version[2]]));
    } else if (isFabric) {
      const mappedItem = fabricManifest.mappings.find(
        v => v.version === version[2]
      );
      const splitItem = version[2].split(mappedItem.separator);
      dispatch(
        addToQueue(instanceName, [
          "fabric",
          splitItem[0],
          version[2],
          version[3]
        ])
      );
    } else if (isForge) {
      dispatch(addToQueue(instanceName, version));
    } else if (isTwitchModpack) {
      const manifest = await downloadAddonZip(
        version[1],
        version[2],
        path.join(instancesPath, instanceName)
      );
      const modloader = [
        version[0],
        manifest.minecraft.version,
        manifest.minecraft.modLoaders
          .find(v => v.primary)
          .id.replace("forge-", ""),
        version[1],
        version[2]
      ];
      dispatch(addToQueue(instanceName, modloader, manifest));
    }
    dispatch(closeModal());
  };

  return (
    <Transition in={inProp} timeout={200}>
      {state => (
        <Animation
          state={state}
          bg={modpack?.attachments?.find(v => v.isDefault)?.thumbnailUrl}
        >
          <Transition in={clicked} timeout={200}>
            {state1 => (
              <>
                <BackgroundOverlay />
                <div
                  state={state1}
                  css={`
                    opacity: ${({ state }) =>
                      state === "entering" || state === "entered" ? 0 : 1};
                    flex: 1;
                    transition: 0.1s ease-in-out;
                    display: flex;
                    justify-content: center;
                    border-radius: 4px;
                    font-size: 40px;
                    cursor: pointer;
                    z-index: 100001;
                    margin: 20px;
                    &:hover {
                      background-color: ${props =>
                        props.theme.palette.primary.light};
                    }
                  `}
                  onClick={() => {
                    setStep(0);
                    if (modpack) {
                      setVersion(null);
                      setModpack(null);
                    }
                  }}
                >
                  {clicked ? "" : <FontAwesomeIcon icon={faLongArrowAltLeft} />}
                </div>
                <div
                  css={`
                    flex: 10;
                    align-self: center;
                    font-size: 30px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 100001;
                  `}
                >
                  <ModpackName state={state1}>{modpack?.name}</ModpackName>
                  <Input
                    state={state1}
                    placeholder="Instance Name"
                    onChange={e => setInstanceName(e.target.value)}
                    css={`
                      && {
                        opacity: ${({ state }) =>
                          state === "entering" || state === "entered" ? 0 : 1};
                        transition: 0.1s ease-in-out;
                        width: 300px;
                        margin: 150px;
                      }
                    `}
                  />
                </div>
                <div
                  state={state1}
                  css={`
                    opacity: ${({ state }) =>
                      state === "entering" || state === "entered" ? 0 : 1};
                    flex: 1;
                    transition: 0.1s ease-in-out;
                    display: flex;
                    justify-content: center;
                    border-radius: 4px;
                    font-size: 40px;
                    cursor: pointer;
                    z-index: 100001;
                    margin: 20px;
                    &:hover {
                      background-color: ${props =>
                        props.theme.palette.primary.light};
                    }
                  `}
                  onClick={() => {
                    createInstance();
                    setClicked(true);
                  }}
                >
                  {clicked || instanceName.length === 0 ? (
                    ""
                  ) : (
                    <FontAwesomeIcon icon={faLongArrowAltRight} />
                  )}
                </div>
              </>
            )}
          </Transition>
        </Animation>
      )}
    </Transition>
  );
};

export default React.memo(InstanceName);

const Animation = styled.div`
  transition: 0.2s ease-in-out;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100000;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  top: 0;
  left: 0;
  background: url(${props => props.bg});
  background-repeat: no-repeat;
  background-size: cover;
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === "entering" || state === "entered" ? 0 : 101)}%
  );
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(12px);
  background: ${props => transparentize(0.4, props.theme.palette.grey[900])};
`;

const ModpackNameKeyframe = keyframes`
  from {
    transform: scale(1) translateY(0);
  }

  35% {
    transform: scale(1) translateY(80%);
  }

  to {
    transform: scale(2) translateY(80%);
  }
`;

const ModpackNameBorderKeyframe = keyframes`
  0% {
    width: 0;
    height: 0;
  }
  25% {
    width: 100%;
    height: 0;
  }
  50% {
    width: 100%;
    height: 100%;
  }
  100% {
    width: 100%;
    height: 100%;
  }
`;

const ModpackNameBorderColorKeyframe = keyframes`
  0% {
    border-bottom-color: white;
    border-left-color: white;
  }
  50% {
    border-bottom-color: white;
    border-left-color: white;
  }
  51% {
    border-bottom-color: transparent;
    border-left-color: transparent;
  }
  100% {
    border-bottom-color: transparent;
    border-left-color: transparent;
  }
`;

const ModpackName = styled.span`
  position: relative;
  font-weight: bold;
  font-size: 45px;
  animation: ${({ state }) =>
      state === "entering" || state === "entered" ? ModpackNameKeyframe : null}
    0.2s ease-in-out forwards;
  box-sizing: border-box;
  overflow: hidden;
  padding: 20px;
  &:before,
  &:after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    border: ${({ state }) =>
        state === "entering" || state === "entered" ? 4 : 0}px
      solid transparent;
    width: 0;
    height: 0;
  }
  &::before {
    top: 0;
    left: 0;
    border-top-color: white;
    border-right-color: white;
    animation: ${({ state }) =>
        state === "entering" || state === "entered"
          ? ModpackNameBorderKeyframe
          : null}
      2s infinite;
  }
  &::after {
    bottom: 0;
    right: 0;
    animation: ${({ state }) =>
          state === "entering" || state === "entered"
            ? ModpackNameBorderKeyframe
            : null}
        2s 1s infinite,
      ${({ state }) =>
          state === "entering" || state === "entered"
            ? ModpackNameBorderColorKeyframe
            : null}
        2s 1s infinite;
  }
`;
