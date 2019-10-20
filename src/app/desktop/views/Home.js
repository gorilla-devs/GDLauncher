import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Instances from "../components/Instances";
import News from "../components/News";
import { downloadInstance } from "../../../common/reducers/actions";
import { _getCurrentDownloadItem } from "../../../common/utils/selectors";

const Home = () => {
  const dispatch = useDispatch();
  const news = useSelector(state => state.news);
  const downloadItem = useSelector(_getCurrentDownloadItem) || {};

  return (
    <div>
      <News news={news} />
      <button
        type="button"
        onClick={() =>
          dispatch(downloadInstance(`TEST ${Math.random()}`, "1.12.2"))
        }
        css=""
      >
        Compute {downloadItem.percentage}
      </button>
      <Instances />
    </div>
  );
};

export default Home;
