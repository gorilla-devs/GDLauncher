import React from "react";
import styled from "styled-components";

const Wrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 25px;
  border-radius: 10px;
`;

const Checkbox = styled.input.attrs({
  type: "checkbox"
})`
  display: none;
`;

const Slider = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.4s;
  height: 25px;
  cursor: pointer;
  background-color: #979ca1;
  border-radius: 30px;

  ${Checkbox}:checked + & {
    background-color: #0f7173;
  }

  ${Checkbox}:focus + & {
    box-shadow: 0 0 1px #0f7173;
  }

  &:before {
    position: absolute;
    content: "";
    left: 3px;
    bottom: 2px;

    transition: 0.4s;

    height: 21px;
    width: 21px;
    background-color: #d2d4d6;
    border-radius: 50%;

    ${Checkbox}:checked + & {
      transform: translateX(23px);
    }
  }
`;

function Switch(props) {
  return (
    <Wrapper style={props.style}>
      <Checkbox
        checked={props.checked}
        onChange={props.onChange}
        onClick={props.onClick}
      />
      <Slider />
    </Wrapper>
  );
}

export default Switch;
