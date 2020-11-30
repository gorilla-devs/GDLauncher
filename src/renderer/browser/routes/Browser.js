import React, { memo } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  text-align: center;
  background: ${props => props.theme.palette.grey[800]};
`;

const Browser = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 30px;
  /* width:  calc(100% - 20px); */
  width: 100%;
  max-width: 900px;
  /* height: 700px; */
  height: 50vh;
  border-radius: 10px;
  text-align: center;
  background: ${props => props.theme.palette.primary.dark};
  overflow-y: auto;
`;

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* flex: 1; */
  margin-top: 200px;
  width: 100%;
  max-width: 900px;
  height: 80vh;
  /* justify-content: space-around; */
  align-items: center;
`;

const ToolBar = styled.div`
  display: flex;
  border-radius: 5px;
  margin: 30px 30px 0;
  height: 100px;
  width: calc(100% - 20px);
  max-width: 900px;
  border: 5px solid ${({ theme }) => theme.palette.primary.main};
  justify-content: space-evenly;
  align-items: center;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  /* align-items: center; */
  width: 100%;

  padding: 10px;
`;

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin: 20px 0;
  width: 100%;
  height: 150px;
  padding: 20px 40px;
  border-radius: 10px;
  text-align: center;
  background: ${props => props.theme.palette.grey[700]};
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
  h4 {
    font-size: 30px;
  }
`;

const Banner = styled.div`
  display: flex;
  width: 100%;
  max-width: 900px;
  height: 200px;
  padding: 10px;
  border-radius: 5px;
  background: ${props => props.theme.palette.grey[700]};
  &:first-child {
    display: none;
  }
`;

const Image = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 10px;
  margin-right: 30px;
  background: gray;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px;
  width: 100%;
  height: 100vh;
  justify-content: space-between;
  align-items: center;
  @media (min-width: 1000px) {
    /* For desktop: */
    /* display: flex; */
    /* div { */
    flex-direction: row;
    align-items: flex-end;

    /* } */
    /* align-items: flex-end; */
    ${Banner} {
      height: 80vh;
      width: 200px;
      &:first-child {
        display: inline-flex;
      }
    }
    ${Browser} {
      height: 70vh;
      margin: 20px 20px 0;
      padding: 0 10px;
      width: calc(100% - 20px);
    }
    ${Item} {
      ${Item}:first-child {
        margin-top: 0;
      }
      ${Item}:last-child {
        margin-bottom: 0;
      }
      margin: 10px 0;
      width: 100%;
      height: 70px;
      padding: 0 20px;
      border-radius: 5px;
      h4 {
        font-size: 15px;
      }
    }
    ${Image} {
      width: 40px;
      height: 40px;
      border-radius: 5px;
    }
    ${ToolBar} {
      height: 50px;
    }
  }
`;

const items = [
  { name: 'mod1' },
  { name: 'mod1' },
  { name: 'mod1' },
  { name: 'mod1' },
  { name: 'mod1' },
  { name: 'mod1' },
  { name: 'mod1' },
  { name: 'mod1' },
  { name: 'mod1' },
  { name: 'mod1' },
  { name: 'mod1' },
  { name: 'mod1' }
];

const BrowserComponent = () => {
  return (
    <Container>
      <InnerContainer>
        <Banner
          css={`
            margin: 0 0 0 10px;
          `}
        />
        <BrowserContainer>
          <ToolBar />
          <Browser>
            <ItemsContainer>
              {items.map(item => (
                <Item key={item.name}>
                  <div
                    css={`
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    `}
                  >
                    <Image />
                    <h4>{item.name}</h4>
                  </div>
                </Item>
              ))}
            </ItemsContainer>
          </Browser>
        </BrowserContainer>
        <Banner
          css={`
            margin: 0 10px 0 0;
          `}
        />
      </InnerContainer>
    </Container>
  );
};

export default memo(BrowserComponent);
