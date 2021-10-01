import {
  faDiscord,
  faFacebook,
  faGithub,
  faInstagram,
  faTwitter
} from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo } from 'react';

const SocialButtons = () => {
  return (
    <div
      css={`
        display: flex;
        justify-content: space-between;
        margin-right: 30px;
        a {
          color: rgba(255, 255, 255, 0.85);
        }
        div {
          width: 28px;
          height: 28px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 4px;
          transition: background 0.1s ease-in-out, transform 0.1s ease-in-out;
          &:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-3px);
            cursor: pointer;
          }
        }
        div:first-child {
          margin-left: 0;
        }
      `}
    >
      <a href="https://discord.gdlauncher.com">
        <div>
          <FontAwesomeIcon icon={faDiscord} size="lg" />
        </div>
      </a>
      <a href="https://github.com/gorilla-devs/GDLauncher">
        <div>
          <FontAwesomeIcon icon={faGithub} size="lg" />
        </div>
      </a>
      <a href="https://twitter.com/gdlauncher">
        <div>
          <FontAwesomeIcon icon={faTwitter} size="lg" />
        </div>
      </a>
      <a href="https://facebook.com/gorilladevs">
        <div>
          <FontAwesomeIcon icon={faFacebook} size="lg" />
        </div>
      </a>
      <a href="https://instagram.com/gdlauncher">
        <div>
          <FontAwesomeIcon icon={faInstagram} size="lg" />
        </div>
      </a>
      <a href="https://gdevs.io">
        <div>
          <FontAwesomeIcon icon={faGlobe} size="lg" />
        </div>
      </a>
    </div>
  );
};

export default memo(SocialButtons);
