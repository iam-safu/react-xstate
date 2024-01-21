import { useEffect, useState } from "react";
import { createActor } from "xstate";

import feedImageMachine from "../../Machines/feedImagesMachine";
import { ImageField } from "../ImageField";
import "./index.css";
import IFeedItem from "../../models/FeedItemModel";

export const LandingPage: React.FC = () => {
  const fetchActor = createActor(feedImageMachine);
  const [articles, setArticles] = useState([]);
  const [loader, setLoader] = useState(true);
  const [error, setError] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const subsription = fetchActor.subscribe((snapshot: any) => {
      if (snapshot.value === "success") {
        setArticles(snapshot.context.articles);
        setLoader(snapshot.context.loader);
        setError(snapshot.context.error);
        setIsCompleted(snapshot.context.noMoreData);
      } else if (snapshot.value === "failure") {
        setLoader(snapshot.context.loader);
        setError(snapshot.context.error);
      }

      // if there is no more data, we are removing the scroll and making the event as completed.
      if (snapshot.context.noMoreData) {
        window.removeEventListener("scroll", handleScroll);
        fetchActor.send({ type: "COMPLETED" });
      }
    });

    fetchActor.start();
    fetchActor.send({ type: "FETCH" });
    window.addEventListener("scroll", handleScroll);
    return () => {
      subsription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScroll = () => {
    if (
      window.innerHeight + Math.round(window.scrollY) >=
        document.body.offsetHeight &&
      fetchActor.getSnapshot().matches("success")
    ) {
      fetchActor.send({ type: "REFETCH" });
    }
  };

  const handleRetry = () => {
    fetchActor.send({ type: "RETRY" });
  };

  return (
    <>
      <div className="wrapper" id="scrollArea">
        {articles.map((article: IFeedItem) => (
          <ImageField article={article} key={article.photo_image_nids} />
        ))}
      </div>

      {loader ? (
        <div className="loader-overlay">
          <div className="loader-container">
            <div className="loader"></div>
            <p>Fetching data...</p>
          </div>
        </div>
      ) : null}

      {error || isCompleted ? (
        <div className="footer">
          {error ? (
            <>
              <p className="helper-text ">
                There was an issue with fetching data.
              </p>
              <button
                className={`retry-button`}
                type="button"
                onClick={handleRetry}
              >
                Retry
              </button>
            </>
          ) : (
            <p className="helper-text ">No more data available.</p>
          )}
        </div>
      ) : null}
    </>
  );
};
