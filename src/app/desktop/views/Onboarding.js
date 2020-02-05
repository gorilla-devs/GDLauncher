import React from "react";
import { useDispatch } from "react-redux";
import { push } from "connected-react-router";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";
import logo from "../../../common/assets/logo.png";

const Background = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100;
  background: #0f7173;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Box = styled.div`
  max-width: 256px;
  display: flex;
  flex-direction: column;
  text-align: center;
  word-wrap: break-word;
`;

const ButtonToHome = styled(FontAwesomeIcon)`
  position: absolute;
  right: 0;
  bottom: 0;
  transition: 0.1s ease-in-out;
  display: flex;
  justify-content: center;
  border-radius: 4px;
  font-size: 50px;
  cursor: pointer;
  z-index: 100001;
  padding: 5px;
  margin: 20px;
  background-color: ${props => props.theme.palette.primary.light};
  &:hover {
    background-color: ${props => props.theme.palette.primary.dark};
  }
`;
const Home = () => {
  const dispatch = useDispatch();

  return (
    <Background>
      <Box>
        <img
          css={`
            margin-bottom: 20px;
          `}
          src={logo}
          alt="logo"
        />
        <p
          css={`
            font-weight: 600;
          `}
        >
          Welcome To GDLauncher!
        </p>
        <p
          css={`
            font-weight: 200;
          `}
        >
          GDLauncher is free and open source, it wouldn&#39;t exist without its
          community. If you find any bug or have any suggestion, tell us on
          Discord!
        </p>
        <p
          css={`
            font-weight: 200;
          `}
        >
          Happy Gaming, Ladvace!
        </p>
      </Box>
      <ButtonToHome
        icon={faLongArrowAltRight}
        type="button"
        onClick={() => dispatch(push("/home"))}
      />
    </Background>
  );
};

export default Home;
