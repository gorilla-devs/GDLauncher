/* eslint flowtype-errors/show-errors: 0 */
import React, { Component, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import  log from 'electron-log';
import { Switch, Route, Redirect } from 'react-router';
import { history } from './store/configureStore';
import { Form, notification } from 'antd';
import { bindActionCreators } from 'redux';
import * as AuthActions from './actions/auth';
import * as SettingsActions from './actions/settings';
import { JAVA_URL } from './constants';
import App from './containers/App';
import store from './localStore';
import SideBar from './components/Common/SideBar/SideBar';
import Navigation from './containers/Navigation';
import SysNavBar from './components/Common/SystemNavBar/SystemNavBar';
import { findJavaHome, isGlobalJavaOptions } from './utils/javaHelpers';
import DManager from './components/DManager/containers/DManagerPage';
import InstanceManagerModal from './components/InstanceManagerModal/containers/InstanceManagerModal';
import Settings from './components/Settings/Settings';
import CurseModpacksBrowser from './components/CurseModpacksBrowser/CurseModpacksBrowser';
import NewUserPage from './components/NewUserPage/NewUserPage';
import ServerManager from './components/ServerManager/ServerManager';

const Login = lazy(() => import('./components/Login/Login'));
const HomePage = lazy(() => import('./components/Home/containers/HomePage'));
const AutoUpdate = lazy(() => import('./components/AutoUpdate/AutoUpdate'));
// const ServerManager = lazy(() =>
//   import('./components/ServerManager/ServerManager')
// );
const InstanceCreatorModal = lazy(() =>
  import('./components/InstanceCreatorModal/containers/InstanceCreatorModal')
);

const ServerCreatorModal = lazy(() =>
  import('./components/ServerCreatorModal/ServerCreatorModal')
);

const loginHelperModal = lazy(() =>
  import('./components/LoginHelperModal/LoginHelperModal')
);
const CurseModpacksBrowserCreatorModal = lazy(() =>
  import('./components/CurseModpacksBrowserCreatorModal/CurseModpacksBrowserCreatorModal')
);
const CurseModpackExplorerModal = lazy(() =>
  import('./components/CurseModpackExplorerModal/CurseModpackExplorerModal')
);
const ImportPack = lazy(() => import('./components/ImportPack/ImportPack'));
const ChangelogsModal = lazy(() =>
  import('./components/ChangelogModal/ChangelogModal')
);
const ConfirmDeleteModal = lazy(() =>
  import('./components/ConfirmDeleteModal/ConfirmDeleteModal')
);
const JavaGlobalOptionsFixModal = lazy(() =>
  import('./components/JavaGlobalOptionsFixModal/JavaGlobalOptionsFixModal')
);

type Props = {
  location: object,
  checkAccessToken: () => void,
  isAuthValid: boolean
};

class RouteDef extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      globalJavaOptions: false
    };
  }

  componentDidMount = async () => {
    const { loadSettings, checkAccessToken } = this.props;
    loadSettings();
    if (!this.props.isAuthValid) checkAccessToken();
    if ((await findJavaHome()) === null) {
      notification.warning({
        duration: 0,
        message: 'JAVA NOT FOUND',
        description: (
          <div>
            Java has not been found. Click{' '}
            <a href={JAVA_URL} target="_blank" rel="noopener noreferrer">
              here
            </a>{' '}
            to download it. After installing you will need to restart your PC.
          </div>
        )
      });
    }
    const globalJavaOptions = await isGlobalJavaOptions();
    this.setState({
      globalJavaOptions
    });

    ipcRenderer.once('closing', () => {
      log.info("CHIUSO");
      ipcRenderer.send('close-started-servers', [
        ...Object.keys(this.props.serversList).map(v => this.props.serversList[v].pid)
      ]);
    });

  };

  componentWillUpdate(nextProps) {
    const { location } = this.props;
    // set previousLocation if props.location is not modal
    if (
      nextProps.history.action !== 'POP' &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = location;
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.state.globalJavaOptions &&
      this.props.location.pathname === '/home' &&
      store.get('showGlobalOptionsJavaModal') !== false
    ) {
      history.push({
        pathname: `/javaGlobalOptionsFix`,
        state: { modal: true }
      });
      this.setState({ globalJavaOptions: false });
    }
  };

  previousLocation = this.props.location;

  render() {
    const { location, isAuthValid } = this.props;
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location
    ); // not initial render
    return (
      <App>
        <SysNavBar />
        <div>
          {location.pathname !== '/' &&
            location.pathname !== '/newUserPage' &&
            location.pathname !== '/loginHelperModal' && (
              <div>
                <Navigation />
                <SideBar />
              </div>
            )}
          <Switch location={isModal ? this.previousLocation : location}>
            <Route
              exact
              path="/"
              component={WaitingComponent(Form.create()(Login))}
            />
            <Route
              exact
              path="/autoUpdate"
              component={WaitingComponent(AutoUpdate)}
            />
            {/* {!isAuthValid && <Redirect push to="/" />} */}
            <Route path="/newUserPage" component={NewUserPage} />
            <Route>
              <div
                style={{
                  width: 'calc(100% - 200px)',
                  position: 'absolute',
                  right: 200
                }}
              >
                <Route path="/dmanager" component={DManager} />
                <Route
                  path="/curseModpacksBrowser"
                  component={CurseModpacksBrowser}
                />
                <Route path="/home" component={WaitingComponent(HomePage)} />
                <Route
                  path="/serverManager"
                  component={(ServerManager)}
                />
              </div>
            </Route>
          </Switch>
        </div>
        {/* Show the changelogs after an update */}
        {location.pathname === '/home' &&
          store.get('showChangelogs') !== false && (
            <Redirect
              push
              to={{
                pathname: '/changelogs',
                state: { modal: true }
              }}
            />
          )}
        {/* ALL MODALS */}
        {isModal ? <Route path="/settings/:page" component={Settings} /> : null}
        {isModal ? (
          <Route
            path="/InstanceCreatorModal"
            component={WaitingComponent(InstanceCreatorModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/curseModpackBrowserCreatorModal/:addonID"
            component={WaitingComponent(CurseModpacksBrowserCreatorModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/curseModpackExplorerModal/:addonID"
            component={WaitingComponent(CurseModpackExplorerModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/editInstance/:instance/:page/:state?/:version?/:mod?"
            component={InstanceManagerModal}
          />
        ) : null}
        {isModal ? (
          <Route path="/importPack" component={WaitingComponent(ImportPack)} />
        ) : null}
        {isModal ? (
          <Route
            path="/loginHelperModal"
            component={WaitingComponent(loginHelperModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/ServerCreatorModal"
            component={WaitingComponent(ServerCreatorModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/changelogs"
            component={WaitingComponent(ChangelogsModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/confirmInstanceDelete/:type/:name"
            component={WaitingComponent(ConfirmDeleteModal)}
          />
        ) : null}
        {isModal ? (
          <Route
            path="/javaGlobalOptionsFix"
            component={WaitingComponent(JavaGlobalOptionsFixModal)}
          />
        ) : null}
      </App>
    );
  }
}

function WaitingComponent(MyComponent) {
  return props => (
    <Suspense
      fallback={
        <div
          style={{
            width: '100vw',
            height: '100vh',
            background: 'var(--secondary-color-1)'
          }}
        >
          Loading...
        </div>
      }
    >
      <MyComponent {...props} />
    </Suspense>
  );
}

function mapStateToProps(state) {
  return {
    location: state.router.location,
    isAuthValid: state.auth.isAuthValid,
    serversList: state.serverManager.servers
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...AuthActions, ...SettingsActions }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RouteDef);
