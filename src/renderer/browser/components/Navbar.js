import React, { memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Menu, Dropdown } from 'antd';
import { NavLink as Link } from 'react-router-dom';
import {
  faChevronDown,
  faTimes,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'src/renderer/common/components/Button';
import routes from 'src/renderer/browser/routes';
import logo from 'src/common/assets/logo.png';
import { openModal } from 'src/renderer/common/reducers/modals/actions';
import styled from 'styled-components';

const Buttons = styled.div`
  list-style-type: none;
  display: flex;
  justify-content: space-around;
`;

const LinkContainer = styled.li`
  display: none !important;
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 0 10px;
  cursor: pointer;
`;

const NavLink = styled(Link)`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 40px;
  &.active {
    /* color: ${props => props.theme.palette.primary.light}; */
    /* font-weight: medium; */
  }
`;

const LoginButton = styled(Button)`
  display: none;
  font-size: 40px;
  font-weight: bold;
  margin: 0;
`;

// const LoginButtonSideBar = styled(Button)`
//   /* display: none; */
//   font-size: 40px;
//   font-weight: bold;
//   margin: 0;
// `;

const Bars = styled.div`
  && > * {
    font-size: 100px;
    display: inline;
    cursor: pointer;
    position: relative;
    z-index: 300;
  }
  z-index: 300;
`;

const Logo = styled.div`
  height: 100px;
  width: 100px;
  transition-delay: 0.1s;
  opacity: ${({ clicked }) => (clicked ? 0 : 1)};
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  margin: 0;
  padding: 0;
  background-image: url(${logo});
`;

const DownloadButton = styled(Button)`
  display: none;
  font-weight: bold;
  background: ${props => props.theme.palette.colors.green};
`;

const InnerContainer = styled.div`
  justify-content: space-between;
  align-items: center;

  display: flex;
  width: 100%;
`;

const SideBarButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  height: 200px;
  &&:hover {
    background: ${props => props.theme.palette.primary.main};
  }
  width: 100%;
`;

const SiderBarDownloadButton = styled(Button)`
  width: 200px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  margin-top: 20px;
  font-weight: bold;
  background: ${props => props.theme.palette.colors.green};
`;

const InnerSideBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
`;

const SideBar = styled.nav`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  background: ${props => props.theme.palette.grey[900]};
  width: 100%;
  transform: ${({ clicked }) =>
    clicked ? 'translateX(0)' : 'translateX(100%)'};
  height: 100vh;
  text-align: left;
  padding: 4rem;
  position: absolute;
  right: 0;
  z-index: 10;
  transition: transform 0.2s ease-in-out;
`;

const NavbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  position: fixed;
  height: 200px;
  max-width: 1920px;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  @media (min-width: 1000px) {
    ${NavbarContainer} {
      height: 100px;
    }
    ${NavLink} {
      font-size: 15px;
      display: inline-flexbox;
    }
    ${LinkContainer} {
      display: inline-flexbox !important;
    }
    ${DownloadButton} {
      display: inline-flexbox;
    }
    ${LoginButton} {
      font-size: 15px;
      display: inline-flexbox;
    }
    ${InnerContainer} {
      display: flex;
      justify-content: normal;
    }
    ${Bars} > * {
      font-size: 30px;
      display: none;
    }
    ${Logo} {
      width: 64px;
      height: 64px;
    }
    ${SideBar} {
      ${SideBar} > * {
        display: none;
      }
      display: none;
    }
  }
`;

const Navbar = () => {
  const dispatch = useDispatch();
  // const login = true;
  const [clicked, setClicked] = useState(false);

  const menu = (
    <Menu
      css={`
        background: ${props => props.theme.palette.primary.dark};
      `}
    >
      <Menu.Item>GD-Meta</Menu.Item>
      <Menu.Item>Cloud-sync</Menu.Item>
    </Menu>
  );

  return (
    <>
      <NavbarContainer>
        <InnerContainer>
          <Logo clicked={clicked} />

          <Buttons
            css={`
              margin-left: 40px;
            `}
          >
            {routes.map(route => (
              <LinkContainer>
                <NavLink key={route.path} to={route.path} exact={route.exact}>
                  {route.name}
                </NavLink>
              </LinkContainer>
            ))}
            {/* {login && (
              <LinkContainer>
                <NavLink to="/profile">Profile</NavLink>
              </LinkContainer>
            )} */}
            <LinkContainer>
              <Dropdown overlay={menu}>
                <div>
                  Services <FontAwesomeIcon icon={faChevronDown} />
                </div>
              </Dropdown>
            </LinkContainer>
            <Bars>
              <FontAwesomeIcon
                css={`
                  z-index: 500;
                `}
                icon={clicked ? faTimes : faBars}
                onClick={() => setClicked(x => !x)}
              />
            </Bars>
          </Buttons>
        </InnerContainer>
        <div
          css={`
            display: flex;
          `}
        >
          <Buttons>
            <LoginButton onClick={() => dispatch(openModal('Login'))}>
              Login
            </LoginButton>
            <DownloadButton>Download</DownloadButton>
          </Buttons>
        </div>
      </NavbarContainer>

      <SideBar clicked={clicked}>
        <InnerSideBarContainer>
          {routes.map(route => (
            <SideBarButton onClick={() => setClicked(x => !x)}>
              <NavLink key={route.path} to={route.path} exact={route.exact}>
                {route.name}
              </NavLink>
            </SideBarButton>
          ))}
          {/* <SideBarButton>
            {login && <NavLink to="/profile">Profile</NavLink>}
          </SideBarButton> */}
          <SideBarButton onClick={() => setClicked(x => !x)}>
            <NavLink
              css={`
                font-weight: bold;
              `}
              to="/login"
            >
              Login
            </NavLink>
          </SideBarButton>
          <SiderBarDownloadButton>Download</SiderBarDownloadButton>
        </InnerSideBarContainer>
      </SideBar>
    </>
  );
};

export default memo(Navbar);
