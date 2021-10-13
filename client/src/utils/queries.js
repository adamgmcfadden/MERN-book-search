// import dependencies -- apollo client
import { gql } from "@apollo/client";

// export GET_ME query
export const GET_ME = gql`
  {
    me {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        authors
        title
        description
        image
        link
      }
    }
  }
`;
