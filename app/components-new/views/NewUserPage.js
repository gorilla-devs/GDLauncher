import React from 'react';
import styled from 'styled-components';
import logo from 'assets/images/Logo.png';

const Bg = styled.div`
  background: ${props => props.theme.palette.primary.main};
  width: 100%;
  height: 100%;
`;

const Div = styled.div`
  display: flex;
  text-align: center;
  flex-direction: column;
  justify-content: space-around;
  position: absolute;
  left: 50%;
  top: 5%;
  margin-left: -128px;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 700;
`;

const SubTitle = styled.div`
  font-size: 20px;
  font-weight: 400;
  width: 256px;
`;

function NewUserPage() {
  return (
    <Bg>
      <iframe
        css={`
          position: absolute;
          top: 10px;
          right: 10px;
        `}
        src="https://discordapp.com/widget?id=398091532881756161&theme=dark"
        width="240"
        height="405"
        allowTransparency="true"
        frameBorder="0"
      />
      <Div>
        <img
          src={logo}
          // css={`
          //   position: absolute;
          //   left: 50%;
          //   top: 5%;
          //   margin-left: -128px;
          // `}
          alt="logo"
        />
        <br />
        <Title>Welcome To GDLauncher</Title>
        <br />
        <SubTitle>
          GDLauncher is free and open source, it wouldn't exist without its
          community. If you find any bug or have any suggestion, tell us on
          Discord!
        </SubTitle>
        <br />
        <div
          css={`
            font-size: 20px;
            font-weight: 400;
            width: 256px;
            flex: 2;
          `}
        >
          Happy Gaming, Ladvace!
        </div>
      </Div>
    </Bg>
  );
}

export default NewUserPage;
