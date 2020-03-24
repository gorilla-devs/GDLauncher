import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLongArrowAltRight,
  faLongArrowAltUp,
  faLongArrowAltDown
} from '@fortawesome/free-solid-svg-icons';
import { _getCurrentAccount } from '../../../common/utils/selectors';
import Logo from '../../../ui/Logo';

const Background = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.palette.colors.darkBlue};
  overflow: hidden;
`;

const scrollToRef = ref =>
  ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

const Home = () => {
  const dispatch = useDispatch();
  const account = useSelector(_getCurrentAccount);
  const [currentSlide, setCurrentSlide] = useState(0);

  const firstSlideRef = useRef(null);
  const secondSlideRef = useRef(null);
  const thirdSlideRef = useRef(null);
  const forthSlideRef = useRef(null);
  const fifthSlideRef = useRef(null);
  const sixthSliderRef = useRef(null);
  const executeScroll = type => {
    if (currentSlide + type < 0 || currentSlide + type > 5) return;
    setCurrentSlide(currentSlide + type);
    switch (currentSlide + type) {
      case 0:
        scrollToRef(firstSlideRef);
        break;
      case 1:
        scrollToRef(secondSlideRef);
        break;
      case 2:
        scrollToRef(thirdSlideRef);
        break;
      case 3:
        scrollToRef(forthSlideRef);
        break;
      case 4:
        scrollToRef(fifthSlideRef);
        break;
      case 5:
        scrollToRef(sixthSliderRef);
        break;
      default:
        scrollToRef(firstSlideRef);
        break;
    }
  };

  return (
    <Background>
      <div
        ref={firstSlideRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.grey[700]};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: ${props => props.theme.palette.text.primary};
        `}
      >
        <div
          css={`
            font-size: 40px;
            font-weight: 700;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          `}
        >
          <Logo size={300} />
          <div
            css={`
              margin-top: 10%;
            `}
          >
            Welcome to GDLauncher
          </div>
          <div
            css={`
              font-style: italic;
            `}
          >
            {account.selectedProfile.name}!
          </div>
        </div>
      </div>
      <div
        ref={secondSlideRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.grey[800]};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: ${props => props.theme.palette.text.primary};
        `}
      >
        <div
          css={`
            font-size: 40px;
            font-weight: 700;
            text-align: center;
          `}
        >
          Before you start playing and having fun, here&apos;s something really
          important we want you to know.
        </div>
      </div>
      <div
        ref={thirdSlideRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.grey[700]};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `}
      >
        <div
          css={`
            font-size: 30px;
            font-weight: 600;
            text-align: center;
            margin: 20%;
          `}
        >
          GDLauncher is free and open source. Only a few developers work on it,
          and they all have a full time job and a life outside of here. They do
          this because they love helping the community by building an incredible
          product that can make Minecraft more enjoyable.
        </div>
      </div>
      <div
        ref={forthSlideRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.grey[800]};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `}
      >
        <div
          css={`
            font-size: 30px;
            font-weight: 600;
            text-align: center;
            margin: 20%;
          `}
        >
          If you like GDLauncher please, take into consideration donating. Even
          the equivalent of a single coffee would let us know that you like our
          product and that we should keep working on it!
          <div
            css={`
              margin: 40px;
            `}
          >
            <a href="https://www.patreon.com/gorilladevs">
              <img
                css={`
                  cursor: pointer;
                `}
                alt="Become a Patron"
                src="https://gdevs.io/img/become_a_patron_button.png"
              />
            </a>
          </div>
        </div>
      </div>
      <div
        ref={fifthSlideRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.grey[700]};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `}
      >
        <div
          css={`
            font-size: 30px;
            font-weight: 600;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            margin: 20%;
          `}
        >
          Also, don&apos;t forget to join us on discord! This is where our
          community is!
          <iframe
            css={`
              margin-top: 40px;
            `}
            src="https://discordapp.com/widget?id=398091532881756161&theme=dark"
            width="350"
            height="410"
            allowTransparency="true"
            frameBorder="0"
            title="discordFrame"
          />
        </div>
      </div>
      <div
        ref={sixthSliderRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.colors.darkBlue};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `}
      >
        <div
          css={`
            font-size: 30px;
            font-weight: 600;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 20%;
          `}
        >
          This is all. Go and have fun now!
        </div>
      </div>
      {currentSlide !== 0 && (
        <div
          css={`
            position: fixed;
            right: 20px;
            top: 40px;
            transition: 0.1s ease-in-out;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 4px;
            font-size: 40px;
            cursor: pointer;
            width: 70px;
            height: 40px;
            color: ${props => props.theme.palette.text.icon};
            &:hover {
              background: ${props => props.theme.action.hover};
            }
          `}
          onClick={() => executeScroll(-1)}
        >
          <FontAwesomeIcon icon={faLongArrowAltUp} />
        </div>
      )}
      <div
        css={`
          position: fixed;
          right: 20px;
          bottom: 20px;
          transition: 0.1s ease-in-out;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 4px;
          font-size: 40px;
          cursor: pointer;
          width: 70px;
          height: 40px;
          color: ${props => props.theme.palette.text.icon};
          &:hover {
            background: ${props => props.theme.action.hover};
          }
        `}
        onClick={() => {
          if (currentSlide === 5) {
            dispatch(push('/home'));
          } else {
            executeScroll(1);
          }
        }}
      >
        <FontAwesomeIcon
          icon={currentSlide === 5 ? faLongArrowAltRight : faLongArrowAltDown}
        />
      </div>
    </Background>
  );
};

export default Home;
