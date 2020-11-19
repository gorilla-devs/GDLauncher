import { lazy } from 'react';
import AsyncComponent from 'src/renderer/common/components/AsyncComponent';

const Login = lazy(() => import('./routes/Login'));

const routes = [
  {
    path: '/',
    exact: true,
    component: AsyncComponent(Login)
  }
];

export default routes;
