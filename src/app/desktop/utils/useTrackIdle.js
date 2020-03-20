import { useEffect } from "react";
import { useSelector } from "react-redux";
import analytics from "../../../common/utils/analytics";

const INTERVAL_DURATION = 5 * 60 * 1000;

const useTrackIdle = pathname => {
  const clientToken = useSelector(state => state.app.clientToken);
  useEffect(() => {
    if (clientToken && process.env.NODE_ENV !== "development") {
      const interval = setInterval(() => {
        analytics.idle(pathname);
      }, INTERVAL_DURATION);

      return () => {
        clearInterval(interval);
      };
    }
  }, [pathname, clientToken]);
};

export default useTrackIdle;
