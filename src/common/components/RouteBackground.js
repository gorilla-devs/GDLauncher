import React from "react";
import background from "../assets/fullHdBackground.jpg";

const RouteBackground = props => {
  return (
    <div
      css={`
        position: absolute;
        background-image: url("${background}");
        background-position: center;
        background-size: cover;
        width: 100%;
        height: 100%;
        z-index: -1;
      `}
    />
  );
};

export default RouteBackground;
