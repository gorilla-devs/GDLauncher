// @flow
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { ipcRenderer } from "electron";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/logo.png";
import { Button } from "../../ui/index";

import { openModal } from "../reducers/modals/actions";

export const Container = styled.div`
  margin: 0;
  width: 100%;
  height: ${({ theme }) => theme.sizes.height.navbar};
  -webkit-user-select: none;
  display: flex;
  justify-content: space-between;
`;

export const SettingsButton = styled.div`
  position: absolute;
  right: 250px;
  font-size: 22px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &:hover {
    color: white;
    transition: all 0.2s ease-in-out;
  }
  path {
    cursor: pointer;
  }
  path:hover {
    color: white;
    transition: all 0.2s ease-in-out;
  }
`;

export const UpdateButton = styled.div`
  z-index: 10;
  text-align: center;
  a {
    text-decoration: none;
    display: block;
  }
`;

export const NavigationContainer = styled.div`
  -webkit-app-region: no-drag;
  font-weight: 700;
  font-size: 16px;
  height: ${({ theme }) => theme.sizes.height.navbar};
  width: 100%;
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
`;

export const NavigationElement = styled.li`
  display: inline;
  cursor: pointer;
  &:hover a,
  &:active a,
  &:focus a {
    text-decoration: none !important;
  }
  a {
    position: relative;
    display: inline-block;
    line-height: 30px;
    color: white;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    svg {
      cursor: pointer;
      path {
        cursor: pointer;
      }
    }
  }
`;

const ProfileSettings = styled.div`
  width: 255px;
  border-radius: 4px;
  transition: background 0.2s ease-in-out;
  &&:hover {
    background: ${props => props.theme.palette.secondary.main};
  }
`;

const ProfileImg = styled.div`
  width: 30px;
  height: 30px;
  background: ${props => props.theme.palette.grey[100]};
  border-radius: 50%;
  margin-top: 4px;
  margin-left: 4px;
  flot: right;
`;

const ProfileName = styled.p`
  float: right;
  margin: 0;
  position: absolute;
  right: 27px;
  top: 12px;
`;

const Navbar = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const location = useSelector(state => state.router.location.pathname);
  const dispatch = useDispatch();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      ipcRenderer.send("check-for-updates");
      ipcRenderer.on("update-available", () => {
        setUpdateAvailable(true);
      });
    }
  }, []);

  const isLocation = loc => {
    if (loc === location) {
      return true;
    }
    return false;
  };

  return (
    <Container>
      <img
        src={logo}
        height="36px"
        alt="logo"
        draggable="false"
        css={`
          z-index: 1;
        `}
      />
      <NavigationContainer>
        <NavigationElement>
          <Link to="/home" draggable="false">
            <Button selected={isLocation("/home")}>Home</Button>
          </Link>
        </NavigationElement>
      </NavigationContainer>
      <SettingsButton>
        <FontAwesomeIcon
          icon={faCog}
          onClick={() => dispatch(openModal("Settings"))}
          css={`
            display: inline-block;
            vertical-align: middle;
          `}
        />
      </SettingsButton>
      <ProfileSettings onClick={() => dispatch(openModal("ProfileSettings"))}>
        <ProfileImg />
        <ProfileName>xXPeppino2310Xx</ProfileName>
      </ProfileSettings>
      {updateAvailable && (
        <UpdateButton>
          <Link to="/autoUpdate">
            <Button type="primary" size="small" style={{ marginLeft: 5 }}>
              Update Available
            </Button>
          </Link>
        </UpdateButton>
      )}
    </Container>
  );
};

export default Navbar;
