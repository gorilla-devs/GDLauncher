import { lazy } from 'react';
import AsyncComponent from 'src/renderer/common/components/AsyncComponent';

const Login = lazy(() => import('./routes/Login'));
const Onboarding = lazy(() => import('./routes/Onboarding'));
const Home = lazy(() => import('./routes/Home'));

const routes = [
  {
    path: '/',
    exact: true,
    component: AsyncComponent(Login)
  },
  {
    path: '/onboarding',
    exact: true,
    component: AsyncComponent(Onboarding)
  },
  {
    path: '/home',
    exact: true,
    component: AsyncComponent(Home)
  }
];

export default routes;
