import React from "react";
import styled from "styled-components";

const Input = styled.input`
  box-sizing: border-box;
  width: ${props => props.width || "100px"};
  height: ${props => props.height || "24px"};
  padding 10px;
  background: transparent;
  border-radius: 5px;
  border: 2px solid #0f7173;
  color: #e1e2e4;
  font-family: Glacial Indifference;
  font-size: 14px;
  line-height: 16px;
  margin: 0 !important;
  &:hover {
    transition: all 0.1s ease-in-out;
    background: ${props => props.theme.palette.secondary.dark};
    opacity: 10%;
    border: 2px solid #0f7173;
  }
  &:active {
    transition: all 0.1s ease-in-out;
    background: ${props => props.theme.palette.secondary.dark};
    opacity: 10%;
    border: 2px solid #0f7173;
  }
  &:focus {
    transition: all 0.1s ease-in-out;
    background: ${props => props.theme.palette.secondary.dark};
    opacity: 10%;
    border: 2px solid #0f7173;
  }
  ::placeholder { 
    color: #e1e2e4;
  }
`;

function GDInput({ ...props }) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Input {...props} />;
}

export default GDInput;
