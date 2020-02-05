import React, { useEffect } from "react";
import { useDidMount } from "rooks";
import styled from "styled-components";
import { Switch } from "react-router";
import { ipcRenderer } from "electron";
import { useSelector, useDispatch } from "react-redux";
import { push } from "connected-react-router";
import RouteWithSubRoutes from "../../common/components/RouteWithSubRoutes";
import {
  loginWithAccessToken,
  initManifests,
  initNews,
  loginThroughNativeLauncher,
  downloadJava,
  switchToFirstValidAccount,
  checkClientToken
} from "../../common/reducers/actions";
import { load, received } from "../../common/reducers/loading/actions";
import features from "../../common/reducers/loading/features";
import GlobalStyles from "../../common/GlobalStyles";
import RouteBackground from "../../common/components/RouteBackground";
import Navbar from "./components/Navbar";
import ga from "../../common/utils/analytics";
import routes from "./utils/routes";
import { _getCurrentAccount } from "../../common/utils/selectors";
import { isLatestJavaDownloaded, extract7z } from "./utils";
import { updateDataPath } from "../../common/reducers/settings/actions";
import SystemNavbar from "./components/SystemNavbar";

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
`;

const Container = styled.div`
  position: absolute;
  top: ${props => props.theme.sizes.height.systemNavbar}px;
  height: calc(100vh - ${props => props.theme.sizes.height.systemNavbar}px);
  width: 100vw;
  display: flex;
  flex-direction: column;
`;

function DesktopRoot() {
  const dispatch = useDispatch();
  const currentAccount = useSelector(_getCurrentAccount);
  const clientToken = useSelector(state => state.app.clientToken);
  const location = useSelector(state => state.router.location);
  const shouldShowDiscordRPC = useSelector(state => state.settings.discordRPC);

  // Handle already logged in account redirect
  useDidMount(() => {
    ipcRenderer
      .invoke("getUserDataPath")
      .then(res => dispatch(updateDataPath(res)))
      .catch(console.error);
    dispatch(checkClientToken());
    dispatch(initManifests())
      .then(async data => {
        await extract7z();
        return data;
      })
      .then(({ launcher }) => isLatestJavaDownloaded(launcher))
      .then(res => {
        if (!res) dispatch(downloadJava());
        return res;
      })
      .catch(console.error);
    dispatch(initNews());
    if (process.env.NODE_ENV === "development" && currentAccount) {
      dispatch(received(features.mcAuthentication));
      dispatch(push("/home"));
    } else if (currentAccount) {
      dispatch(
        load(features.mcAuthentication, dispatch(loginWithAccessToken()))
      ).catch(async err => {
        console.error(err);
        dispatch(switchToFirstValidAccount());
      });
    } else {
      dispatch(
        load(features.mcAuthentication, dispatch(loginThroughNativeLauncher()))
      ).catch(console.error);
    }
    if (shouldShowDiscordRPC) {
      ipcRenderer.send("init-discord-rpc");
    }
  });

  useEffect(() => {
    if (clientToken && process.env.NODE_ENV !== "development") {
      ga.setUserId(clientToken);
      ga.trackPage(location.pathname);
    }
  }, [location.pathname, clientToken]);

  return (
    <Wrapper>
      <SystemNavbar />
      <Container>
        <GlobalStyles />
        <RouteBackground />
        <Navbar />
        <Switch>
          {routes.map((route, i) => (
            <RouteWithSubRoutes key={i} {...route} /> // eslint-disable-line
          ))}
        </Switch>
      </Container>
    </Wrapper>
  );
}

export default DesktopRoot;
