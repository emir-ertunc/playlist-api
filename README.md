# Playlist API

SE 4458 – Assignment 2 (Group 2, Playlist)

| | |
|---|---|
| Code | https://github.com/emir-ertunc/playlist-api |
| Deployment | https://playlist-api-m619.onrender.com/api/v1/tracks |

## Design

- Node.js with Express, data is kept in memory (a plain array), Swagger UI is served at `/api-docs`.
- The code is split into layers: routes, controllers, services, repositories, dtos and models. Controllers only handle the request and response, services hold the logic (validation, search, sort, filter, reorder, summary) and the repository is the only place that touches the array.
- The API is versioned (`/api/v1/tracks`) and resources are plural nouns.
- PUT and DELETE are idempotent. Starring uses `PUT` and `DELETE` on `/tracks/:id/star` instead of a toggle, so repeating a request gives the same result.
- The list endpoint supports `search` (title, artist, album), `genre`, `starred`, `sort` (position, title, artist, length), `dir` and pagination (`page`, `limit`, max 100).
- Other endpoints: add, edit and delete a track, `PUT /tracks/order` for drag and drop reordering, `GET /tracks/summary` for the track count and total length.
- Every response has the same shape: `{ ok, data, meta }` on success and `{ ok: false, error: { message } }` on errors.

## Assumptions

- A track needs a title, an artist and a length in seconds. Album, genre and cover are optional and genre defaults to `Other`.
- A new track is added to the end of the playlist.
- Reordering needs every track id exactly once.
- Delete confirmation belongs to the client, the API just deletes.
- Genre filtering is an exact match and ignores upper and lower case.

## Issues I encountered

- Express treated `/summary` as a track id until I declared the fixed routes before `/:id`.
- The server crashed on start once because a route handler was `undefined` (a missing export in the controller).
- Data is only in memory, so it goes back to the five starting tracks every time the hosting service restarts the app.
