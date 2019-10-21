import React from "react";
import { useDidMount } from "rooks";
import styled from "styled-components";
import { push } from "connected-react-router";
import { Switch } from "react-router";
import { ipcRenderer } from "electron";
import { useSelector, useDispatch } from "react-redux";
import RouteWithSubRoutes from "../../common/components/RouteWithSubRoutes";
import {
  loginWithAccessToken,
  initManifests,
  initNews,
  loginThroughNativeLauncher,
  downloadJava
} from "../../common/reducers/actions";
import { load, received } from "../../common/reducers/loading/actions";
import features from "../../common/reducers/loading/features";
import GlobalStyles from "../../common/GlobalStyles";
import RouteBackground from "../../common/components/RouteBackground";
import Navbar from "./components/Navbar";
import routes from "./utils/routes";
import { _getCurrentAccount } from "../../common/utils/selectors";
import { isLatestJavaDownloaded, extract7z } from "./utils";

const Wrapper = styled.div`
  height: 100%;
  width: 100vw;
  display: flex;
  flex-direction: column;
`;

function DesktopRoot() {
  const dispatch = useDispatch();
  const currentAccount = useSelector(_getCurrentAccount);

  // Handle already logged in account redirect
  useDidMount(() => {
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
      dispatch(received(features.accountAuthentication));
      dispatch(push("/home"));
    } else if (currentAccount) {
      dispatch(
        load(features.mcAuthentication, dispatch(loginWithAccessToken()))
      ).catch(console.error);
    } else {
      dispatch(
        load(features.mcAuthentication, dispatch(loginThroughNativeLauncher()))
      ).catch(console.error);
    }
    ipcRenderer.send("init-discord-rpc");
  });

  return (
    <Wrapper>
      <GlobalStyles />
      <RouteBackground />
      <Navbar />
      <Switch>
        {routes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} /> // eslint-disable-line
        ))}
      </Switch>
    </Wrapper>
  );
}

export default DesktopRoot;
