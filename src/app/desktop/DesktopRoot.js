import React from "react";
import styled from "styled-components";
import { Switch } from "react-router";
import RouteWithSubRoutes from "../../common/components/RouteWithSubRoutes";
import GlobalStyles from "../../common/GlobalStyles";
import routes from "./utils/routes";

const Wrapper = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  margin: 10px 20px 20px 20px;
`;

function DesktopRoot() {
  return (
    <Wrapper>
      <GlobalStyles />
      <Switch>
        {routes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
      </Switch>
    </Wrapper>
  );
}

export default DesktopRoot;
