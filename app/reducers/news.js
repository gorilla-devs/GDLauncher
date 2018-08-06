import {
  START_LOADING_NEWS,
  STOP_LOADING_NEWS,
  UPDATE_NEWS
} from '../actions/news';

const initialState = {
  news: [],
  loadingNews: false
};

export default function News(state = initialState, action) {
  switch (action.type) {
    case `${START_LOADING_NEWS}`:
      return {
        ...state,
        loadingNews: true
      };
    case `${STOP_LOADING_NEWS}`:
      return {
        ...state,
        loadingNews: false
      };
    case `${UPDATE_NEWS}`:
      return {
        ...state,
        news: action.payload
      };
    default:
      return state;
  }
}
