import "reflect-metadata";
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
// import { Post } from './entities/Post';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const emFork = orm.em.fork();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: emFork }),
  });
  
  app.listen(4000, () => {
    console.log('server started on localhost:4000');
  });

  apolloServer.applyMiddleware({ app });

  // const post = emFork.create(Post, {
  //   title: 'my first post',
  //   createdAt: '',
  //   updatedAt: ''
  // });
  // await emFork.persistAndFlush(post);

  // const posts = await emFork.find(Post, {});
  // console.log(posts);
}

main().catch((err) => {
  console.error(err);
});