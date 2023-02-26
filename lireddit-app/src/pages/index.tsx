import React from "react";
import { Navbar } from "../components/Navbar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../gen/graphql";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <Navbar />
      <div>
        <a>hello world</a>
      </div>
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((p) => (
          <div key={p.id}>
            <a>{p.title}</a>
          </div>
        ))
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
