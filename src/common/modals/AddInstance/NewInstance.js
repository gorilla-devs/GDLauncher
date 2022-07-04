/* eslint-disable */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Cascader } from 'antd';
import styled from 'styled-components';
import { getFilteredVersions } from '../../../app/desktop/utils';
import { FABRIC, FORGE, VANILLA } from '../../utils/constants';

const NewInstance = ({ setVersion, setModpack }) => {
  const vanillaManifest = useSelector(state => state.app.vanillaManifest);
  const fabricManifest = useSelector(state => state.app.fabricManifest);
  const forgeManifest = useSelector(state => state.app.forgeManifest);

  const filteredVers = useMemo(() => {
    return getFilteredVersions(vanillaManifest, forgeManifest, fabricManifest);
  }, [vanillaManifest, forgeManifest, fabricManifest]);

  return (
    <Container>
      <Cascader
        options={filteredVers}
        onChange={v => {
          if (!v) {
            setVersion(null);
          } else if (v[0] === VANILLA) {
            setVersion({ loaderType: v[0], mcVersion: v[2] });
          } else if (v[0] === FORGE) {
            setVersion({
              loaderType: v[0],
              mcVersion: v[1],
              loaderVersion: v[2]
            });
          } else if (v[0] === FABRIC) {
            setVersion({
              loaderType: v[0],
              mcVersion: v[2],
              loaderVersion: v[3]
            });
          }
          setModpack(null);
        }}
        placeholder="Select a version"
        size="large"
        css={`
          width: 400px !important;
        `}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export default React.memo(NewInstance);
