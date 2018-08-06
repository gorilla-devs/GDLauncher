import axios from 'axios';
import { message } from 'antd';
import X2JS from 'x2js';
import { NEWS_URL } from '../constants';

export const START_LOADING_NEWS = 'START_LOADING_NEWS';
export const STOP_LOADING_NEWS = 'STOP_LOADING_NEWS';
export const UPDATE_NEWS = 'UPDATE_NEWS';

export function getNews() {
  return async (dispatch, getState) => {
    const { news } = getState();
    if (news.news.length === 0) {
      dispatch({
        type: START_LOADING_NEWS
      });
      try {
        const res = await axios.get(NEWS_URL);
        dispatch({ type: UPDATE_NEWS, payload: res.data.entries });
      } catch (err) {
        console.error(err.message);
        message.warning('There was an error while updating the news.');
      } finally {
        dispatch({
          type: STOP_LOADING_NEWS
        });
      }
    }
  };
}
