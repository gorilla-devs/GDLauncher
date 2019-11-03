/* eslint-disable */
import React, { useMemo } from "react";
import styled from "styled-components";
import { Transition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltLeft, faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";
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
            onClick={() => setStep(0)}
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
