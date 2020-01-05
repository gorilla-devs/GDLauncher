import React from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import CloseButton from "./CloseButton";
import { closeModal } from "../reducers/modals/actions";

const HeaderComponent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  font-size: 16px;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 10px;
  height: 40px;
  background: ${props => props.theme.palette.grey[700]};
  border-radius: 4px;
  h3 {
    line-height: 40px;
    margin: 0;
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
          <CloseButton onClick={() => dispatch(closeModal())} />
        </HeaderComponent>
      )}
      <div
        header={header}
        css={`
          height: ${header === undefined || header === true
            ? "calc(100% - 40px)"
            : "100%"};
          padding: ${props =>
            props.header === undefined || props.header === true ? 20 : 0}px;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
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
