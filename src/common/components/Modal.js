import React from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { closeModal } from "../reducers/modals/actions";

const HeaderComponent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 20px);
  padding: 0 10px;
  height: 40px;
  background: var(--secondary-color-2);
  border-radius: 4px;
`;

const CloseButton = styled.div`
  font-size: 20px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  &:hover {
    color: ${props => props.theme.red};
  }
`;

const Modal = ({
  transparentBackground,
  height,
  width,
  header,
  title,
  backBtn,
  children
}) => {
  const dispatch = useDispatch();
  return (
    <div
      onClick={e => e.stopPropagation()}
      transparentBackground={transparentBackground}
      height={height}
      width={width}
      css={`
        background: ${props =>
          props.transparentBackground
            ? "transparent"
            : "black"};
        position: absolute;
        border-radius: 4px;
        height: ${props => props.height || "100vh"};
        width: ${props => props.width || "100vw"};
      `}
    >
      {(header === undefined || header === true) && (
        <HeaderComponent>
          <h3>{title || "Modal"}</h3>
          <CloseButton onClick={() => dispatch(closeModal())}>
            <FontAwesomeIcon icon={faWindowClose} />
          </CloseButton>
        </HeaderComponent>
      )}
      <div
        header={header}
        css={`
          height: ${header === undefined || header === true
            ? "calc(100% - 40px - 40px)"
            : "100%"};
          padding: ${({ header }) =>
            header === undefined || header === true ? 20 : 0}px;
          overflow-y: auto;
        `}
      >
        <span onClick={() => dispatch(closeModal())}>
          {backBtn !== undefined && backBtn}
        </span>
        {children}
      </div>
    </div>
  );
};

export default Modal;
