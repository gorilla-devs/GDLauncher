import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";
import logo from "../../../common/assets/logo.png";
import { _getCurrentAccount } from "../../../common/utils/selectors";

const Background = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.palette.colors.darkBlue};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Box = styled.div`
  max-width: 505px;
  display: flex;
  flex-direction: column;
  text-align: center;
  word-wrap: break-word;
`;

const ButtonToHome = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  transition: 0.1s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  font-size: 40px;
  cursor: pointer;
  margin: 20px;
  width: 70px;
  height: 40px;
  color: ${props => props.theme.palette.text.icon};
  &:hover {
    background: ${props => props.theme.action.hover};
  }
`;
const Home = () => {
  const dispatch = useDispatch();
  const account = useSelector(_getCurrentAccount);

  return (
    <Background>
      <iframe
        css={`
          position: absolute;
          top: 20px;
          right: 20px;
        `}
        src="https://discordapp.com/widget?id=398091532881756161&theme=dark"
        width="270"
        height="410"
        allowTransparency="true"
        frameBorder="0"
        title="discordFrame"
      />
      <Box>
        <img
          css={`
            margin-left: 25%;
            margin-bottom: 30px;
            max-width: 256px;
          `}
          src={logo}
          alt="logo"
        />
        <p
          css={`
            font-family: Roboto;
            font-style: normal;
            font-weight: bold;
            font-size: 36px;
            line-height: 42px;
          `}
        >
          Welcome to GDLauncher {account.selectedProfile.name}!
        </p>
        <p
          css={`
            font-style: normal;
            font-weight: normal;
            font-size: 24px;
            line-height: 28px;
            text-align: center;
          `}
        >
          GDLauncher is free and open source, and is led by only a couple of
          developers, who invest a lot of their time into building it. If you
          enjoy GDLauncher, please consider showing it to the devs by donating a
          dollar
        </p>
        <p>
          <a href="https://www.patreon.com/gorilladevs">
            <img
              css={`
                cursor: pointer;
              `}
              alt="Become a Patron"
              src="https://gdevs.io/img/become_a_patron_button.png"
            />
          </a>
        </p>
        <p
          css={`
            margin-top: 40px;
            font-style: normal;
            font-weight: normal;
            font-size: 24px;
            line-height: 28px;
            text-align: center;
          `}
        >
          Have fun!
        </p>
      </Box>
      <ButtonToHome>
        <FontAwesomeIcon
          icon={faLongArrowAltRight}
          onClick={() => dispatch(push("/home"))}
        />
      </ButtonToHome>
    </Background>
  );
};

export default Home;
