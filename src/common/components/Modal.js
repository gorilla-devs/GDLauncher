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
  font-size: 16px;
  justify-content: space-between;
  width: calc(100%);
  padding: 0 10px;
  height: 40px;
  background: ${props => props.theme.palette.grey[700]};
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
  header,
  title,
  backBtn,
  children,
  className
}) => {
  const dispatch = useDispatch();
  return (
    <div
      onClick={e => e.stopPropagation()}
      transparentBackground={transparentBackground}
      className={className}
      css={`
        background: ${props =>
          props.transparentBackground
            ? "transparent"
            : props.theme.palette.grey[800]};
        position: absolute;
        border-radius: 4px;
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
          padding: ${props =>
            props.header === undefined || props.header === true ? 20 : 0}px;
          overflow-y: auto;
          overflow-x: hidden;
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
