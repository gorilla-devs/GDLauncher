import React, { useEffect, memo } from 'react';
import EV from 'src/common/messageEvents';
import styled from 'styled-components';
import sendMessage from '../../helpers/sendMessage';

const Container = styled.div`
  position: relative;
  width: 180px;
  height: 100px;
  transform: ${p =>
    p.isHovered && !p.installing
      ? 'scale3d(1.1, 1.1, 1.1)'
      : 'scale3d(1, 1, 1)'};
  margin-right: 20px;
  margin-top: 20px;
  transition: transform 150ms ease-in-out;
  &:hover {
    ${p => (p.installing ? '' : 'transform: scale3d(1.1, 1.1, 1.1);')}
  }
`;

const Instance = ({ uid }) => {
  //   const dispatch = useDispatch();
  //   const [background, setBackground] = useState();
  //   const instance = useSelector(state => _getInstance(state)(uid));

  useEffect(async () => {
    const bg = await sendMessage(EV.GET_INSTANCE_BACKGROUND, uid);
    console.log(bg);
    // if (instance.background) {
    //   fs.readFile(path.join(instancesPath, instanceName, instance.background))
    //     .then(res =>
    //       setBackground(`data:image/png;base64,${res.toString('base64')}`)
    //     )
    //     .catch(console.warning);
    // } else {
    //   setBackground(`${instanceDefaultBackground}`);
    // }
  }, []);

  return (
    <>
      <Container>{uid}</Container>
    </>
  );
};

export default memo(Instance);
