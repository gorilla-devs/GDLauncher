import { lazy } from "react";
import AsyncComponent from "../../../common/components/AsyncComponent";

const Login = lazy(() => import("../views/Login"));
const Home = lazy(() => import("../views/Home"));
const Onboarding = lazy(() => import("../views/Onboarding"));

const routes = [
  {
    path: "/",
    exact: true,
    component: AsyncComponent(Login)
  },
  {
    path: "/home",
    component: AsyncComponent(Home)
  },
  {
    path: "/onboarding",
    component: AsyncComponent(Onboarding)
  }
];

export default routes;
