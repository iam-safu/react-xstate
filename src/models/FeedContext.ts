import IFeedItem from "./FeedItemModel";

export default interface IFeedContext {
  page: number;
  articles: IFeedItem[];
  error: unknown;
  noMoreData: boolean;
  showLoader: boolean;
}
