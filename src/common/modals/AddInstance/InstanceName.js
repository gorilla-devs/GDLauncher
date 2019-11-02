/* eslint-disable */
import React, { useMemo } from "react";
import styled from "styled-components";
import { Transition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltLeft } from "@fortawesome/free-solid-svg-icons";
import { transparentize } from "polished";
import { Input } from "antd";

const InstanceName = ({ in: inProp, setStep }) => {
  return (
    <Transition in={inProp} timeout={200}>
      {state => (
        <Animation state={state}>
          <div
            css={`
              flex: 1;
              margin: 0 20px;
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
              font-size: 30px;
              display: flex;
              justify-content: center;
            `}
          >
            <Input
              placeholder="Instance Name"
              css={`
                && {
                  width: 300px;
                }
              `}
            />
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
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.palette.primary.main};
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === "entering" || state === "entered" ? 0 : -101)}%
  );
`;
