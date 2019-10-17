import React from "react";
import styled from "styled-components";
import Slider from "@material-ui/core/Slider";

const StyledSlider = styled(Slider)`
  .MuiSlider-root {
    height: 4px;
    padding: 4px !important;
  }

  .MuiSlider-track {
    height: 4px;
  }

  .MuiSlider-rail {
    height: 4px;
    background: #7a8086;
  }

  .MuiSlider-thumb {
    margin-left: -9px;
    margin-top: -8px;
    width: 20px;
    height: 20px;
    background: #c4c4c4;
    border: 3px solid ${props => props.theme.palette.primary.main};
  }

  .MuiSlider-mark {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    margin-top: -4px;
    background: #c4c4c4;
  }

  .MuiSlider-markActive {
    height: 10px;
    width: 10px;
    margin-top: -5px;
    background: #c4c4c4;
    opacity: 1;
    border: 2px solid ${props => props.theme.palette.primary.main};
  }

  .MuiSlider-valueLabel {
    margin-left: 2px;
  }
`;

function GDSlider(props) {
  return (
    <StyledSlider
      style={props.style}
      onClick={props.onClick}
      onChange={props.onChange}
      className={props.className}
      defaultValue={props.defaultValue}
      valueLabelDisplay={props.valueLabelDisplay}
      marks={props.marks}
      disabled={props.disabled}
      max={props.max}
      min={props.min}
      orientation={props.orientation}
      step={props.step}
      value={props.value}
      ValueLabelComponent={props.ValueLabelComponent}
      onChangeCommitted={props.onChangeCommitted}
    />
  );
}

export default GDSlider;
