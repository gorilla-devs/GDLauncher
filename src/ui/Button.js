import React from "react";
import styled from "styled-components";
import Button from "@material-ui/core/Button";

const StyledButton = styled(Button)``;

function GDSelect({ children, ...props }) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <StyledButton {...props}>{children}</StyledButton>;
}

export default GDSelect;
