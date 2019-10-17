import React, { useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

// background: ${props => props.theme.palette.primary.main};
const StyledCheckBox = styled.div`
  background: #0f7173;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  -webkit-user-select: none;
  user-select: none;
`;

const CheckIcon = styled(FontAwesomeIcon)`
  visibility: ${props => (props.checked ? "visible" : "hidden")};
  user-select: none;
  color: white;
  transition: visibility 0.02s ease-in-out;
`;

function GDCheckBox() {
  const [checked, setChecked] = useState(false);

  return (
    <StyledCheckBox onClick={() => setChecked(!checked)}>
      {/* <StyledCheckBox
        type="checkbox"
        style={props.style}
        className={props.className}
        onClick={props.onClick}
      /> */}
      <CheckIcon
        style={{
          height: "10px",
          width: "10px",
          marginLeft: "2.5px",
          marginBottom: "2.25px",
          userSelect: "none"
        }}
        icon={faCheck}
        checked={checked}
      />
    </StyledCheckBox>
  );
}

export default GDCheckBox;
