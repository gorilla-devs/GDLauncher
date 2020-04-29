import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { useSelector } from 'react-redux';
import Modal from '../../components/Modal';
import { _getCurrentAccount } from '../../utils/selectors';
import logo from '../../assets/logo.png';

const scrollToRef = ref =>
  ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

const Onboarding = () => {
  const [page, setPage] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const account = useSelector(_getCurrentAccount);
  const slides = ['Welcome', 'info', 'info2', 'info3'];

  const firstSlideRef = useRef(null);
  const secondSlideRef = useRef(null);
  const thirdSlideRef = useRef(null);
  const forthSlideRef = useRef(null);
  const fifthSlideRef = useRef(null);
  const sixthSliderRef = useRef(null);

  const executeScroll = type => {
    if (currentSlide + type < 0 || currentSlide + type > 4) return;
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
    <Modal
      css={`
        height: 80%;
        width: 900px;
        max-height: 700px;
      `}
      removePadding
    >
      <Container>
        <SideBar>
          {slides.map((title, i) => {
            return (
              <SectionButton
                // active={page === 1}
                onClick={() => {
                  setPage(i);
                  executeScroll(i - page);
                }}
              >
                {title}
              </SectionButton>
            );
          })}
        </SideBar>

        <Content>
          <SlideContainer ref={firstSlideRef}>
            <LogoContainer>
              <Logo src={logo} />
              Welcome to GDLauncher&nbsp;
              {account.selectedProfile.name}!
            </LogoContainer>
          </SlideContainer>

          <SlideContainer ref={secondSlideRef}>
            <Text>
              Before you start playing and having fun, here&apos;s something
              really important we want you to know.
            </Text>
          </SlideContainer>

          <SlideContainer ref={thirdSlideRef}>
            <Text>
              GDLauncher is free and open source. Only a few developers work on
              it, and they all have a full time job and a life outside of here.
              They do this because they love helping the community by building
              an incredible product that can make Minecraft more enjoyable.
            </Text>
          </SlideContainer>

          <SlideContainer ref={forthSlideRef}>
            <div
              css={`
                font-size: 30px;
                font-weight: 600;
                text-align: center;
                margin: 20%;
              `}
            >
              If you like GDLauncher please, take into consideration donating.
              Even the equivalent of a single coffee would let us know that you
              like our product and that we should keep working on it!
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
          </SlideContainer>
        </Content>
      </Container>
    </Modal>
  );
};

export default Onboarding;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const SideBar = styled.div`
  left: 0;
  flex: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: flex-end;
  background: ${props => props.theme.palette.grey[800]};
  padding-top: calc(${props => props.theme.sizes.height.systemNavbar});
`;

const Content = styled.div`
  flex: 1;
  flex-grow: 5;
  background: ${props => props.theme.palette.secondary.main};
  transition: 0.3s ease-in-out;
  overflow: hidden;
`;

const SlideContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 20px;
`;

const SectionButton = styled(Button)`
  align-items: left;
  justify-content: left;
  text-align: left;
  width: 70%;
  height: 30px;
  border-radius: 4px 0 0 4px;
  font-size: 12px;
  white-space: nowrap;
  background: ${props =>
    props.active
      ? props.theme.palette.grey[600]
      : props.theme.palette.grey[800]};
  border: 0px;
  text-align: left;
  color: ${props => props.theme.palette.text.primary};
  &:hover {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[700]};
  }
  &:focus {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[600]};
  }
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  font-weight: 700;
`;

const Logo = styled.img`
  width: 300px;
`;

const Text = styled.div`
  font-weight: 600;
  text-align: center;
  font-size: 30px;
  max-width: 60%;
`;
