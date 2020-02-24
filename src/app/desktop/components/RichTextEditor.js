import React from "react";
import styled from "styled-components";

const Options = styled.div`
  position: relative;
  padding: 1px 18px 17px;
  margin: 0px -20px 20px;
  border-bottom: 2px solid rgb(238, 238, 238);
`;

const Overview = () => {
  return (
    <>
      <Options>
        <div>Bold</div>
      </Options>
      <textarea placeholder="Type here your notes!" />
    </>
  );
};

export default Overview;
