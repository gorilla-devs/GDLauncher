import React from "react";
import styled from "styled-components";
import Button from "@material-ui/core/Button";

const StyledButton = styled(Button)`
  background: ${props =>
    props.color === "primary"
      ? props.theme.palette.primary.main
      : "transparent"};
  color: white;
`;

function GDSelect({ children, ...props }) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <StyledButton {...props}>{children}</StyledButton>;
}

export default GDSelect;
