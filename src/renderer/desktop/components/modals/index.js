import { lazy } from 'react';
import AsyncComponent from 'src/renderer/common/components/AsyncComponent';

export default {
  Changelogs: AsyncComponent(lazy(() => import('./Changelogs'))),
  AccountsManager: AsyncComponent(lazy(() => import('./AccountsManager'))),
  AddAccount: AsyncComponent(lazy(() => import('./AddAccount'))),
  AddInstance: AsyncComponent(lazy(() => import('./AddInstance'))),
  CurseForgeModpackOverview: AsyncComponent(
    lazy(() => import('./CurseForgeModpackOverview'))
  )
};
