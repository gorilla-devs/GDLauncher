import React from 'react';
import News from 'components/common/News';
import { useSelector } from 'react-redux';
import StyledRipple from '../../../../ui/Ripple';

const Home = () => {
  const news = useSelector(state => state.news);
  return (
    <div
      style={{
        width: '100%',
        // left: '50%',
        height: '100%'
        // backgroundColor: 'red'
        // padding: '0px 10px 10px 10px'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          // left: 0,
          // right: 0,
          width: 788,
          height: '100%',
          backgroundColor: 'transparent',
          left: '50%',
          marginLeft: '-394px'
        }}
      >
        {/* <Button>Ciao</Button> */}
        <div
          style={{
            widht: '100%',
            height: '28%',
            // backgroundColor: 'purple',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            marginBottom: 10
          }}
        >
          <News news={news} />
        </div>
        <div
          style={{
            widht: '100%',
            height: '70%',
            backgroundColor: '#212B36',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0
          }}
        >
          <StyledRipple
            css={`
              width: 100%;
              height: 100%;
            `}
          >
            prova
          </StyledRipple>
        </div>
      </div>
    </div>
  );
};

export default Home;
