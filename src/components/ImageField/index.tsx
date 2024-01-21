import moment from "moment-timezone";
import "./index.css";
import IFeedItem from "../../models/FeedItemModel";

function formatTimestamp(timestamp: number) {
  const date = moment.unix(timestamp).tz("Asia/Kolkata");
  return date.format("MMM DD, YYYY hh:mm A z");
}

interface IImageField {
  article: IFeedItem;
}

export const ImageField: React.FC<IImageField> = (props) => {
  const { article } = props;
  return (
    <div className="image-field">
      <img
        className="image-preview"
        src={article.field_photo_image_section}
        alt={article.author_name}
        loading="lazy"
      />
      <div className="image-summary">
        <span className="summary_title" title={article.title}>
          {article.title}
        </span>
        <span className="summary_timestamp">
          {formatTimestamp(article.last_update)}
        </span>
      </div>
    </div>
  );
};
