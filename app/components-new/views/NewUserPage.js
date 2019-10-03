import React, { useState } from 'react';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import logo from 'assets/images/Logo.png';
import DelayLink from '../common/DelayLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

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

const defaultStyle = {
  transition: `all ${700}ms ease-in-out`,
  height: 'calc(100vh - 20px)',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '0 0'
};

const internalDivStyles = {
  entered: { opacity: 1 }
};

function NewUserPage() {
  const [mounted, setMounted] = useState(true);

  const transitionStyles = {
    entered: {
      backgroundSize: `${window.screen.availWidth * 3}px ${window.screen
        .availHeight * 3}px`
    },
    exiting: {
      backgroundSize: `0px 0px`
    }
  };

  return (
    <Bg>
      <Transition in={mounted} timeout={{ enter: 250, exit: 0 }} appear key="1">
        {state => (
          <div
            style={{
              ...defaultStyle,
              ...transitionStyles[state]
            }}
          >
            <div
              style={{
                opacity: 0,
                transition: 'all 400ms ease-in-out',
                padding: 30,
                ...internalDivStyles[state]
              }}
            >
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
                  GDLauncher is free and open source, it wouldn't exist without
                  its community. If you find any bug or have any suggestion,
                  tell us on Discord!
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
              <DelayLink
                to="home"
                delay={685}
                onDelayStart={() => setMounted(false)}
                css={`
                  position: absolute;
                  bottom: 15%;
                  right: 10%;
                  color: white;
                `}
              >
                <FontAwesomeIcon
                  icon={faArrowRight}
                  size="2x"
                  css={`
                    position: absolute;
                    bottom: 15%;
                    right: 10%;
                    color: white;
                  `}
                />
              </DelayLink>
            </div>
          </div>
        )}
      </Transition>
    </Bg>
  );
}

export default NewUserPage;
