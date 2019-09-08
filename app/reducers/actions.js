import * as ActionTypes from './actionTypes';

export function removeAccount(uuid) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.REMOVE_ACCOUNT,
      uuid
    });
  };
}

export function updateAccount(uuid, account) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_ACCOUNT,
      uuid,
      account
    });
  };
}

export function updateNews(news) {
  return async (dispatch, getState) => {
    const { news, loading: { loading_news } } = getState();
    if (news.length === 0 && !loading_news) {
      try {
        const res = await axios.get(NEWS_URL);
        const newsArr = await Promise.all(
          res.data.article_grid.map(async item => {
            return {
              title: item.default_tile.title,
              description: item.default_tile.sub_header,
              // We need to get the header image of every article, since
              // the ones present in this json are thumbnails
              image: await getArticleHeaderImage(item.article_url),
              url: `https://minecraft.net${item.article_url}`
            };
          })
        );
        dispatch({ type: UPDATE_NEWS, payload: newsArr.splice(0, 12) });
      } catch (err) {
        log.error(err.message);
      }
    }
  };
};
