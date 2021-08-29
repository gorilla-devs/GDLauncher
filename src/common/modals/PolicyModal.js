import React, { lazy, memo, useMemo } from 'react';

import Modal from '../components/Modal';
import AsyncComponent from '../components/AsyncComponent';

const policies = {
  privacy: {
    component: AsyncComponent(
      lazy(() => import('../components/PrivacyPolicy'))
    ),
    title: 'Privacy Policy'
  },
  tos: {
    component: AsyncComponent(
      lazy(() => import('../components/TermsAndConditions'))
    ),
    title: 'Terms and Conditions'
  },
  acceptableuse: {
    component: AsyncComponent(
      lazy(() => import('../components/AcceptableUsePolicy'))
    ),
    title: 'Acceptable Use Policy'
  }
};

const PolicyModal = ({ policy }) => {
  const PolicyComponent = useMemo(() => policies[policy].component, [policy]);
  return (
    <Modal
      css={`
        height: 550px;
        width: 900px;
      `}
      title="Policy"
      removePadding
    >
      <div
        css={`
          overflow: auto;
          height: 100%;
          padding: 20px;

          & > h1 {
            text-align: center;
          }

          & > div {
            display: flex;
            margin: 40px 0;

            & > h2 {
              flex: 1;
              font-weight: bold;
              padding-right: 30px;
            }

            & > div {
              p {
                -webkit-user-select: text;
                user-select: text;
                cursor: initial;
              }

              flex: 2;
              color: ${props => props.theme.palette.text.third};
            }
          }
        }
        `}
      >
        <PolicyComponent />
      </div>
    </Modal>
  );
};

export default memo(PolicyModal);
