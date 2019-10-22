import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Instances from "../components/Instances";
import News from "../components/News";
import { addToQueue } from "../../../common/reducers/actions";
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
        onClick={() => dispatch(addToQueue(`TEST ${Math.random()}`, "19w42a"))}
        css=""
      >
        Compute {downloadItem.percentage}
      </button>
      <Instances />
    </div>
  );
};

export default Home;
