import { assign, fromPromise, setup } from "xstate";
import IFeedContext from "../models/FeedContext";
import IFeedItem from "../models/FeedItemModel";

const fetchImageFeed = (page: number) =>
  fetch(
    `https://englishapi.pinkvilla.com/app-api/v1/photo-gallery-feed-page/page/${page}`
  )
    .then((response) => response.json())
    .then((res) => {
      return res.nodes.map((e: { node: IFeedItem }) => e.node);
    });

const feedImageMachine = setup({
  guards: {
    isDataAvailable: ({ context }) => !context.noMoreData,
  },
  actors: {
    fetchArticleData: fromPromise(async ({ input }: { input: number }) => {
      console.log(input);
      const user = await fetchImageFeed(input);
      return user;
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMyQJIFsCGMB0AlhADZgDEAYgKIAqAwgBIDaADALqKgAOA9rAQBcCPAHacQAD0QBGAKwAWADQgAnogBM6gGx51sgL77lqDDnzEe2CARFQyEUWEIiAbjwDWTmAKy4wAEWwBbFYOJBBefiFRcSkELQU8AE4tAA4AdlllNQQ5HQBmTMNjNAhfc0trWzIwACdanlq8LmIg5EbMPG9ygKCQ9nFIwWExcLi5JVVEVOk8AyMQEzKzJ2RsAmIAV1ryACVaXYBNUMG+YZixmQVsmUy8IuKQER4IOHElntOokdjEAFotDcEADHh8VoQSGAvudRqA4vJ1EDNDoHiVTH48BYrDYoNDorDJIh8vIWHN5GlMkC5LJdPM0csMbBNgBjZlweDhIb434IVLyWbpGZ6KmC+50xalHp4NYbbZQzlnbmXBAIqksJJ4eSyVL5XV6-XyQyGIA */
  types: {} as {
    context: IFeedContext;
  },
  id: "feedImage",
  initial: "idle",
  context: {
    page: 1,
    articles: [],
    error: undefined,
    noMoreData: false,
    showLoader: true,
  },
  states: {
    idle: {
      on: {
        FETCH: { target: "loading" },
      },
    },
    loading: {
      invoke: {
        id: "getArticleData",
        src: "fetchArticleData",
        input: ({ context }) => {
          return context.page;
        },
        actions: assign({
          loader: () => {
            return true;
          },
        }),
        onDone: {
          target: "success",
          actions: assign({
            articles: ({ context, event }) => [
              ...context.articles,
              ...event.output,
            ],
            noMoreData: ({ event }) => {
              return !event.output || !event.output.length;
            },
          }),
        },
        onError: {
          target: "failure",
          actions: assign({
            error: ({ event }) => event.error,
            loader: () => {
              return false;
            },
          }),
        },
      },
    },
    success: {
      entry: assign({
        page: ({ context }) => context.page + 1,
        loader: () => {
          return false;
        },
        error: () => false,
      }),
      on: {
        REFETCH: { target: "loading", guard: "isDataAvailable" },
        COMPLETED: {
          target: "completed",
        },
      },
    },
    failure: {
      on: {
        RETRY: { target: "loading" },
      },
      after: {
        5000: "loading",
      },
    },
    completed: {
      type: "final",
    },
  },
});

export default feedImageMachine;
