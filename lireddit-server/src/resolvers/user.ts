import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType, Query } from "type-graphql";
import argon2 from 'argon2';
import { EntityManager } from "@mikro-orm/postgresql";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { em, req }: MyContext
  ) {
    console.log("session: ", req.session);
    // you are not logged in
    if (!req.session!.userId) {
      return null;
    }

    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    const user = await em.findOne(User, { id: req.session!.userId });

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [{
          field: 'username',
          message: "length must be greater than 2",
        }],
      };
    }

    if (options.password.length <= 3) {
      return {
        errors: [{
          field: 'password',
          message: "length must be greater than 3",
        }],
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    // const user = em.create(User, {
    //   username: options.username,
    //   createdAt: "",
    //   updatedAt: "",
    //   password: hashedPassword
    // });
    let user;
    try {
      const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
        username: options.username,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
      user = result[0]
    } catch(err) {
      // duplicate username error
      if (err.code === '23505' || err.detail.includes('already exists')) {
        return {
          errors: [{
            field: 'username',
            message: "username already exists",
          }],
        };
      }
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username })
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: "that username does not exist",
        }],
      };
    }
    const valid = await argon2.verify(user.password, options.password)
    if (!valid) {
      return {
        errors: [{
          field: 'password',
            message: "incorrect password",
        }],
      };
    }
    req.session.userId = user.id;
    // req.session.randomKey = "matt is cool";
    return {
      user
    };
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ) {
    return new Promise(resolve => req.session.destroy(err => {
      res.clearCookie('qid');
      if (err) {
        console.log(err);
        resolve(false);
        return;
      }
      resolve(true);
    }))
  }
}