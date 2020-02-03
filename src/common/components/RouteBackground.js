import React from "react";
// import background from "../assets/fullHdBackground.jpg";

const RouteBackground = () => {
  return (
    <div
      css={`
        position: absolute;
        background: ${props => props.theme.palette.secondary.main};
        width: 100%;
        height: 100%;
        z-index: -1;
      `}
    />
  );
};

// const RouteBackground = () => {
//   return (
//     <div
//       css={`
//         position: absolute;
//         background-image: url("${background}");
//         background-position: center;
//         background-size: cover;
//         width: 100%;
//         height: 100%;
//         z-index: -1;
//       `}
//     />
//   );
// };

export default RouteBackground;
