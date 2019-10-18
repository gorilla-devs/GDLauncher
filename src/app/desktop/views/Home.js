import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Instances from "../components/Instances";
import News from "../components/News";
import { downloadInstance } from "../../../common/reducers/actions";

const Home = () => {
  const dispatch = useDispatch();
  const news = useSelector(state => state.news);

  return (
    <div>
      <News news={news} />
      <button
        type="button"
        onClick={() =>
          dispatch(downloadInstance("test", "1.6.4", "forge-9.11.1.1345"))
        }
        css={`
          display: none;
        `}
      >
        Compute
      </button>
      <Instances />
    </div>
  );
};

export default Home;
