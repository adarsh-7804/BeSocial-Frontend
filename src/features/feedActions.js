import { fetchFeedApi } from "../api/feedApi";
import {
  fetchStart,
  fetchSuccess,
  fetchMore,
  fetchError,
} from "./feedSlice";

export const fetchFeed = (type, page = 1) => async (dispatch, getState) => {
  try {
    dispatch(fetchStart());

    const res = await fetchFeedApi(type, page);

    if (page === 1) {
      dispatch(fetchSuccess(res.data));
    } else {
      dispatch(fetchMore(res.data));
    }
  } catch (err) {
    dispatch(fetchError(err.response?.data?.message));
  }
};