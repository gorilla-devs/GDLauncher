import React from "react";
import { useDidMount } from "rooks";
import styled from "styled-components";
import { Switch } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import RouteWithSubRoutes from "../../common/components/RouteWithSubRoutes";
import {
  loginWithAccessToken,
  initManifests,
  initNews,
  loginThroughNativeLauncher
} from "../../common/reducers/actions";
import { load } from "../../common/reducers/loading/actions";
import features from "../../common/reducers/loading/features";
import GlobalStyles from "../../common/GlobalStyles";
import RouteBackground from "../../common/components/RouteBackground";
import Navbar from "./components/Navbar";
import routes from "./utils/routes";
import { _getCurrentAccount } from "../../common/utils/selectors";

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
    dispatch(initManifests());
    dispatch(initNews());
    if (currentAccount) {
      dispatch(
        load(features.mcAuthentication, dispatch(loginWithAccessToken()))
      ).catch(console.error);
    } else {
      dispatch(
        load(features.mcAuthentication, dispatch(loginThroughNativeLauncher()))
      ).catch(console.error);
    }
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
