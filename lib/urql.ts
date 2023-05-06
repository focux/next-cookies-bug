import { cacheExchange, Client, createClient, fetchExchange } from "@urql/core";
import { authExchange } from "@urql/exchange-auth";
import { cookies } from "next/headers";

export const getAccessToken = async () => {
  const res = await fetch(`http://localhost:3000/api/auth/access-token`, {
    cache: "no-store",
    headers: {
      cookie: cookies()
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join(";"),
    },
  });

  if (res.status === 401) {
    throw new Error("Forbidden");
  }

  return (await res.json()) as { accessToken: string };
};

export const getClient = () => {
  return createClient({
    url: `https://graphql-pokeapi.graphcdn.app/`,
    fetchOptions: {
      cache: "no-store",
    },
    requestPolicy: "network-only",
    exchanges: [
      cacheExchange,
      authExchange(async (utils) => {
        const { accessToken: token } = await getAccessToken();

        return {
          addAuthToOperation: (operation) => {
            if (!token) {
              return operation;
            }

            return utils.appendHeaders(operation, {
              Authorization: `Bearer ${token}`,
            });
          },
          didAuthError(error) {
            return error.graphQLErrors.some(
              (e) => e.extensions?.code === "UNAUTHENTICATED"
            );
          },
          async refreshAuth() {
            const { accessToken: token } = await getAccessToken();
          },
        };
      }),
      fetchExchange,
    ],
  });
};
