# MovieHub API Documentation

## Authentication

### Signup
- **POST** `/api/auth/signup`
  - Request body: `{ name, email, password }`
  - Returns: User details and sets HTTP-only cookie

### Login
- **POST** `/api/auth/login`
  - Request body: `{ email, password }`
  - Returns: User details and sets HTTP-only cookie

### Logout
- **POST** `/api/auth/logout`
  - Clears authentication cookie

### Current User
- **GET** `/api/auth/me`
  - Returns: Currently authenticated user details

## Movies

### Add Movie
- **POST** `/api/movies`
  - Request body: `{ title, description }`
  - Requires authentication
  - Returns: Created movie

### Get Movies
- **GET** `/api/movies`
  - Returns: List of movies sorted by score (upvotes - downvotes)

## Votes

### Add/Update Vote
- **POST** `/api/votes`
  - Request body: `{ movieId, voteType }` (voteType: 'up' or 'down')
  - Requires authentication
  - Returns: Vote record

## Comments

### Add Comment
- **POST** `/api/comments`
  - Request body: `{ movieId, body }`
  - Requires authentication
  - Returns: Created comment

### Get Comments
- **GET** `/api/comments/movie/:movieId`
  - Returns: List of comments for a movie

### Delete Comment
- **DELETE** `/api/comments/:id`
  - Requires authentication (owner or admin)
  - Returns: Success message

## Admin

### Delete Movie
- **DELETE** `/api/admin/movies/:id`
  - Requires admin authentication
  - Returns: Success message

### Top Movies
- **GET** `/api/admin/top-movies`
  - Requires admin authentication
  - Returns: Top 10 movies by score
