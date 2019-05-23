import axios from 'axios';
import { message } from 'antd';
import cheerio from 'cheerio';
import log from 'electron-log';
import { NEWS_URL } from '../constants';

export const START_LOADING_NEWS = 'START_LOADING_NEWS';
export const STOP_LOADING_NEWS = 'STOP_LOADING_NEWS';
export const UPDATE_NEWS = 'UPDATE_NEWS';

export function getNews() {
  return async (dispatch, getState) => {
    const { news } = getState();
    if (news.news.length === 0 && !news.loadingNews) {
      dispatch({
        type: START_LOADING_NEWS
      });
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
      } finally {
        dispatch({
          type: STOP_LOADING_NEWS
        });
      }
    }
  };
}

async function getArticleHeaderImage(articleURL) {
  // This extracts a <meta property="og:image" content="some url" />
  // and gets the url of the header image
  const req = await axios.get(`https://minecraft.net${articleURL}`);
  const $ = cheerio.load(req.data);
  const url = $('meta[property="og:image"]').prop('content');
  return url;
}
