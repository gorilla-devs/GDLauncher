import axios from 'axios';
import { NEWS_URL } from 'src/common/utils/constants';
import * as ActionTypes from './actionTypes';

export const updateShowNews = showNews => {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SHOW_NEWS,
      showNews
    });
  };
};

export const initNews = () => {
  return async (dispatch, getState) => {
    const {
      news,
      loading: { fetchingNews }
    } = getState();
    if (news.length === 0 && !fetchingNews.isRequesting) {
      try {
        const res = await axios.get(NEWS_URL);
        const newsArr = await Promise.all(
          res.data.article_grid.map(async item => {
            return {
              title: item.default_tile.title,
              description: item.default_tile.sub_header,
              // We need to get the header image of every article, since
              // the ones present in this json are thumbnails
              image: `https://minecraft.net${item.default_tile.image.imageURL}`,
              url: `https://minecraft.net${item.article_url}`
            };
          })
        );
        dispatch({
          type: ActionTypes.UPDATE_NEWS,
          news: newsArr.splice(0, 12)
        });
      } catch (err) {
        console.error(err.message);
      }
    }
  };
};

export const initStoreFromMain = storeValues => {
  return dispatch => {
    dispatch({
      type: ActionTypes.INIT_STORE_VALUES,
      data: storeValues
    });
  };
};

export const updateIsNewUser = value => {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_IS_NEW_USER,
      value
    });
  };
};
