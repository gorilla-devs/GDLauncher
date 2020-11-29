import { lazy } from 'react';
import AsyncComponent from 'src/renderer/common/components/AsyncComponent';

const Profile = lazy(() => import('./Profile'));
const Browser = lazy(() => import('./Browser'));
const Home = lazy(() => import('./Home'));

const routes = [
  {
    path: '/',
    exact: true,
    name: 'Home',
    component: AsyncComponent(Home)
  },
  {
    path: '/Browser',
    exact: false,
    name: 'Browser',
    component: AsyncComponent(Browser)
  },
  {
    path: '/Profile',
    exact: false,
    name: 'Profile',
    component: AsyncComponent(Profile)
  }
];

export default routes;
