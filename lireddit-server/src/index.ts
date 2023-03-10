import "reflect-metadata";
import { MikroORM } from '@mikro-orm/core';
import { COOKIE_NAME, __prod__ } from './constants';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { createClient } from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from "./types";
import cors from 'cors';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const emFork = orm.em.fork();

  const app = express();

  const RedisStore = connectRedis(session)
  const redisClient = createClient({ legacyMode: true })
  redisClient.connect().catch(console.error);

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }))

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ 
        client: redisClient as any, 
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: 'environmentvariablelater',
      resave: false,
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, HelloResolver, PostResolver],
      validate: false,
    }),
    context: ({req, res}): MyContext => ({ em: emFork, req, res }),
  });
  
  app.listen(4000, () => {
    console.log('server started on localhost:4000');
  });

  apolloServer.applyMiddleware({ app, cors: false });
}

main().catch((err) => {
  console.error(err);
});