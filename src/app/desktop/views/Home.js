import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import NavBar from "../../../common/components/Navbar";
import background from "../../../assets/fullHdBackground.jpg";
import News from "../../../common/components/News";

const Background = styled.div`
  background-image: url("${background}");
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100%;
  `;

const Container = styled.div`
  width: 830px;
  height: 100%;
  position: absolute;
  top: Calc(${props => props.theme.sizes.height.navbar} + 10px);
  left: 50%;
  margin-left: -415px;
`;

const NewsContainer = styled.div`
  margin-bottom: 10px;
  width: 830px;
`;

// background: ${props => props.theme.palette.secondary.main};
const InstancesContainer = styled.div`
  width: 100%;
  height: 80%;
  background: ${props => props.theme.palette.grey[800]};
  margin-bottom: 10px;
`;

const Home = () => {
  const news = useSelector(state => state.news);

  return (
    <Background>
      <NavBar />
      <Container>
        <NewsContainer>
          <News news={news} />
        </NewsContainer>
        <InstancesContainer />
      </Container>
    </Background>
  );
};

export default Home;
