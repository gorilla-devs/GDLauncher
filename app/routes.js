import React, { lazy, Suspense } from 'react';

function WaitingComponent(MyComponent) {
  return props => (
    <Suspense fallback={null}>
      <MyComponent {...props} />
    </Suspense>
  );
}

const Login = lazy(() => import('App/components-new/views/login'));
const HomePage = lazy(() => import('App/components-new/views/home'));
// const AutoUpdate = lazy(() => import('./components/AutoUpdate/AutoUpdate'));
// const NewUserPage = lazy(() => import('./components/NewUserPage/NewUserPage'));
const Modpacks = lazy(() => import('App/components-new/views/modpacks'));

const routes = [
  {
    path: '/',
    exact: true,
    component: WaitingComponent(Login)
  },
  // {
  //   path: '/autoUpdate',
  //   component: WaitingComponent(AutoUpdate)
  // },
  // {
  //   path: '/newUserPage',
  //   component: WaitingComponent(NewUserPage)
  // },
  {
    path: '/home',
    component: WaitingComponent(HomePage)
  },
  {
    path: '/modpacks',
    component: WaitingComponent(Modpacks)
  }
];

export default routes;
