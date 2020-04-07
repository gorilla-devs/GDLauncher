import { lazy } from 'react';
import AsyncComponent from '../../../common/components/AsyncComponent';
import withScroll from './withScroll';

const Login = lazy(() => import('../views/Login'));
const Home = lazy(() => import('../views/Home'));

const routes = [
  {
    path: '/',
    exact: true,
    component: AsyncComponent(Login)
  },
  {
    path: '/home',
    component: withScroll(AsyncComponent(Home))
  }
];

export default routes;
