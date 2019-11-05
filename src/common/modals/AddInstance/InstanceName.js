/* eslint-disable */
import React, { useState } from "react";
import styled from "styled-components";
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
import { downloadAddonFile } from "../../../app/desktop/utils";
import { _getAddonsPath } from "../../utils/selectors";

const InstanceName = ({ in: inProp, setStep, version }) => {
  const dispatch = useDispatch();
  const addonsPath = useSelector(_getAddonsPath);
  const fabricManifest = useSelector(state => state.app.fabricManifest);
  const [instanceName, setInstanceName] = useState("");

  const createInstance = async () => {
    if (!version || !instanceName) return;
    const isVanilla = version[0] === "vanilla";
    const isFabric = version[0] === "fabric";
    const isForge = version[0] === "forge";
    const isTwitchModpack = version[0] === "twitchModpack";
    console.log(version)
    if (isVanilla) {
      dispatch(addToQueue(instanceName, version[2]));
    } else if (isFabric) {
      const mappedItem = fabricManifest.mappings.find(
        v => v.version === version[2]
      );
      const splitItem = version[2].split(mappedItem.separator);
      dispatch(
        addToQueue(instanceName, splitItem[0], [
          "fabric",
          version[2],
          version[3]
        ])
      );
    } else if (isForge) {
      dispatch(addToQueue(instanceName, version[1], version));
    } else if (isTwitchModpack) {
      await downloadAddonFile(version[1], version[2], addonsPath);
    }
    dispatch(closeModal());
  };

  return (
    <Transition in={inProp} timeout={200}>
      {state => (
        <Animation state={state}>
          <div
            css={`
              flex: 1;
              transition: 0.1s ease-in-out;
              display: flex;
              justify-content: center;
              border-radius: 4px;
              font-size: 40px;
              cursor: pointer;
              &:hover {
                background-color: ${props => props.theme.palette.primary.light};
              }
            `}
            onClick={() => setStep(0)}
          >
            <FontAwesomeIcon icon={faLongArrowAltLeft} />
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
            `}
          >
            <Input
              placeholder="Instance Name"
              onChange={e => setInstanceName(e.target.value)}
              css={`
                && {
                  width: 300px;
                }
              `}
            />
          </div>
          <div
            css={`
              flex: 1;
              transition: 0.1s ease-in-out;
              display: flex;
              justify-content: center;
              border-radius: 4px;
              font-size: 40px;
              cursor: pointer;
              &:hover {
                background-color: ${props => props.theme.palette.primary.light};
              }
            `}
            onClick={() => createInstance()}
          >
            <FontAwesomeIcon icon={faLongArrowAltRight} />
          </div>
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
  padding: 20px;
  background: ${props => props.theme.palette.primary.main};
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === "entering" || state === "entered" ? 0 : 101)}%
  );
`;
