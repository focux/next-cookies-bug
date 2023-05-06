import { gql } from "urql/core";
import { getClient } from "../lib/urql";

const pokemonsQuery = gql`
  query pokemons {
    pokemons(limit: 10, offset: 10) {
      count
      next
      previous
      status
      message
      results {
        url
        name
        image
      }
    }
  }
`;

/** Add your relevant code here for the issue to reproduce */
export default async function Home() {
  const { data } = await getClient().query(pokemonsQuery, {}).toPromise();

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
