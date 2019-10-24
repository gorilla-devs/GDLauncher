import React from "react";
import styled from "styled-components";
import Slider from "@material-ui/core/Slider";

const StyledSlider = styled(Slider)`
  .MuiSlider-root {
    height: 4px;
    padding: 4px;
  }

  .MuiSlider-track {
    height: 4px;
  }

  .MuiSlider-rail {
    height: 4px;
    background: ${props => props.theme.palette.grey[200]};
  }

  .MuiSlider-thumb {
    margin-left: -9px;
    margin-top: -8px;
    width: 20px;
    height: 20px;
    background: ${props => props.theme.palette.grey[50]};
    border: 3px solid ${props => props.theme.palette.primary.main};
  }

  .MuiSlider-mark {
    height: 5px;
    width: 5px;
    border-radius: 50%;

    background: #c4c4c4;
  }

  .MuiSlider-markActive {
    height: 5px;
    width: 5px;
    margin-top: -2px;
    background: #c4c4c4;
    opacity: 1;
    border: 2px solid ${props => props.theme.palette.primary.main};
  }

  .MuiSlider-valueLabel {
    margin-left: 2px;
  }
`;

function GDSlider(props) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <StyledSlider {...props} />;
}

export default GDSlider;
