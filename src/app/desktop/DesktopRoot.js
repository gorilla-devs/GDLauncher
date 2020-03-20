import React, { useEffect, memo } from "react";
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
import useTrackIdle from "./utils/useTrackIdle";

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
  const javaPath = useSelector(state => state.settings.java.path);
  const dataPathFromStore = useSelector(state => state.settings.dataPath);
  const location = useSelector(state => state.router.location);
  const shouldShowDiscordRPC = useSelector(state => state.settings.discordRPC);

  const init = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const dataPathStatic = await ipcRenderer.invoke("getUserDataPath");
    const dataPath =
      dataPathFromStore || dispatch(updateDataPath(dataPathStatic));
    dispatch(checkClientToken());
    dispatch(initNews());
    const manifests = await dispatch(initManifests());
    await extract7z();
    const isLatestJava = await isLatestJavaDownloaded(manifests.java, dataPath);
    const isJavaOK = javaPath || isLatestJava;
    if (!isJavaOK) {
      dispatch(downloadJava());
    }

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
      ipcRenderer.invoke("init-discord-rpc");
    }
  };

  // Handle already logged in account redirect
  useDidMount(init);

  useEffect(() => {
    if (clientToken && process.env.NODE_ENV !== "development") {
      ga.setUserId(clientToken)
        .then(() => ga.trackPage(location.pathname))
        .catch(console.error);
    }
  }, [location.pathname, clientToken]);

  useTrackIdle(location.pathname);

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

export default memo(DesktopRoot);
