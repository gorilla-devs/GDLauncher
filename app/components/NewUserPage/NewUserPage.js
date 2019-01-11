import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Transition } from 'react-transition-group';
import DelayLink from '../Common/DelayLink';
import { THEMES } from '../../constants';
import store from '../../localStore';
import background from '../../assets/images/login_background.jpg';
import circleBlue from '../../assets/images/circleBlue.svg';


const colors = store.get('settings') ? store.get('settings').theme : THEMES.default;

const defaultStyle = {
  transition: `all ${700}ms ease-in-out`,
  backgroundImage: `url(${circleBlue})`,
  height: 'calc(100vh - 20px)',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '0 0'
}


const internalDivStyles = {
  entered: { opacity: 1 }
}

const NewUserPage = props => {
  const [mounted, setMounted] = useState(true);
  const transitionStyles = {
    entered: {
      backgroundSize: `${window.screen.availWidth * 3}px ${window.screen.availHeight * 3}px`
    },
    exiting: {
      backgroundSize: `0px 0px`
    }
  };
  return (
    <div style={{
      background: `linear-gradient( ${colors['secondary-color-2']}8A, ${colors['secondary-color-2']}8A), url(${background})`
    }}>
      <Transition in={mounted} timeout={{ enter: 250, exit: 0 }} appear={true} key="1">
        {(state) => (
          <div style={{
            ...defaultStyle,
            ...transitionStyles[state],
          }}>
            <div style={{
              opacity: 0,
              transition: 'all 400ms ease-in-out',
              padding: 30,
              ...internalDivStyles[state]
            }}>
              <h1 style={{ fontSize: 37 }}>Welcome to GDLauncher!</h1>
              <div style={{ display: 'flex' }}>
                <p style={{ fontSize: 25 }}>
                  Hello {props.username}!<br />
                  GDLauncher is free and open source,
                  it wouldn't exist without its community. If you find any bug or have any suggestion, tell us on Discord!<br /><br />
                  Happy gaming!
                </p>
                <iframe style={{
                  marginTop: '-70px',
                  paddingLeft: 30
                }} src="https://discordapp.com/widget?id=398091532881756161&theme=dark" width="350" height="515" allowtransparency="true" frameborder="0"></iframe>
              </div>
              <DelayLink
                to="home"
                delay={685}
                onDelayStart={() => setMounted(false)}
                style={{
                  position: 'absolute',
                  bottom: 30,
                  fontSize: 25,
                }}>
                GOT IT
              </DelayLink>
            </div>
          </div>
        )}
      </Transition>
    </div>
  )
};

const mapStateToProps = state => ({
  username: state.auth.displayName
})

export default connect(mapStateToProps)(NewUserPage);