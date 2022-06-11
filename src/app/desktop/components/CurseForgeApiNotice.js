import React, { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'antd';

import { hideThirdPartyLauncherNotice } from '../../../common/reducers/settings/actions';

const CurseForgeApiNotice = () => {
  const dispatch = useDispatch();

  const cfApiNoticeDismissed = useSelector(
    state => state.settings.hideCurseforgeThirdPartyDownloadsNotice
  );

  const dismissCfApiNotification = () => {
    dispatch(hideThirdPartyLauncherNotice());
  };

  return cfApiNoticeDismissed ? (
    <div />
  ) : (
    <div
      css={`
        margin-top: 10px;
        padding: 30px;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        color: ${props => props.theme.palette.colors.yellow};
      `}
    >
      <p>
        CurseForge authors may prevent third-party launchers (such as this one)
        from downloading their mods. As such you may need to download some mods
        manually.
      </p>
      <div>
        <Button onClick={dismissCfApiNotification}>Dismiss</Button>
      </div>
    </div>
  );
};

export default memo(CurseForgeApiNotice);
