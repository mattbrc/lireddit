import { Box, Link, Flex, Button } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../gen/graphql";
// import { isServer } from "../utils/isServer";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery();
  let body = null;
  // data is loading
  if (fetching) {
    // user not logged in
  } else if (!data?.me) {
    body = (
      <div>
        <NextLink href="/login" passHref legacyBehavior>
          <Link color="white" mr={2}>
            login
          </Link>
        </NextLink>
        <NextLink href="/register" passHref legacyBehavior>
          <Link color="white" mr={2}>
            register
          </Link>
        </NextLink>
      </div>
    );
    // user is logged in
  } else {
    body = (
      <Flex>
        <Box color="white" mr={2}>
          {data.me.username}
        </Box>
        <Button
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
          color="white"
          variant="link"
        >
          logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg="primaryPurple" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
