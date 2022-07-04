import { lazy } from 'react';
import AsyncComponent from '../../../common/components/AsyncComponent';
import withScroll from './withScroll';

const Login = lazy(() => import('../views/Login'));
const Home = lazy(() => import('../views/Home'));
const Onboarding = lazy(() => import('../views/Onboarding'));

const routes = [
  {
    path: '/',
    exact: true,
    component: AsyncComponent(Login)
  },
  {
    path: '/home',
    component: withScroll(AsyncComponent(Home))
  },
  {
    path: '/onboarding',
    component: AsyncComponent(Onboarding)
  }
];

export default routes;
