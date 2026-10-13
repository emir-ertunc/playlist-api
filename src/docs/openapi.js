const trackExample = {
  id: 1,
  position: 1,
  title: 'Blinding Lights',
  artist: 'The Weeknd',
  album: 'After Hours',
  length: 212,
  lengthText: '3:32',
  genre: 'Pop',
  cover: '',
  starred: true
};

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer', minimum: 1 },
  description: 'Track id'
};

const errorResponse = (description) => ({
  description,
  content: {
    'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } }
  }
});

const trackResponse = (description) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Track' }
        }
      }
    }
  }
});

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Playlist API',
    version: '1.0.0',
    description:
      'REST API for managing a playlist: add, edit and remove tracks, search, sort, filter by genre, ' +
      'star favourites and reorder the list. All data is kept in memory and resets when the server restarts.'
  },
  servers: [{ url: '/', description: 'Current server' }],
  tags: [
    { name: 'Tracks', description: 'Create, read, update and delete tracks' },
    { name: 'Stars', description: 'Mark tracks as favourites' },
    { name: 'Playlist', description: 'Ordering and summary of the whole playlist' }
  ],
  paths: {
    '/api/v1/tracks': {
      get: {
        tags: ['Tracks'],
        summary: 'List tracks',
        description: 'Supports search, genre filter, starred filter, sorting and pagination.',
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Matches title, artist or album (case-insensitive)'
          },
          {
            name: 'genre',
            in: 'query',
            schema: { type: 'string' },
            description: 'Exact genre, for example Pop or R&B. Leave empty for all genres'
          },
          {
            name: 'starred',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Set to true to see only starred tracks'
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['position', 'title', 'artist', 'length'], default: 'position' }
          },
          {
            name: 'dir',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' }
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
          }
        ],
        responses: {
          200: {
            description: 'A page of tracks',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Track' } },
                    meta: { $ref: '#/components/schemas/PageMeta' }
                  }
                }
              }
            }
          },
          400: errorResponse('Invalid query parameter')
        }
      },
      post: {
        tags: ['Tracks'],
        summary: 'Add a track',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TrackInput' },
              example: {
                title: 'As It Was',
                artist: 'Harry Styles',
                album: 'Harrys House',
                length: 167,
                genre: 'Pop'
              }
            }
          }
        },
        responses: {
          201: trackResponse('Track created, it is added to the end of the playlist'),
          400: errorResponse('Validation error')
        }
      }
    },
    '/api/v1/tracks/summary': {
      get: {
        tags: ['Playlist'],
        summary: 'Playlist summary',
        description: 'Total number of tracks and total playing time.',
        responses: {
          200: {
            description: 'Summary',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Summary' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/tracks/order': {
      put: {
        tags: ['Playlist'],
        summary: 'Reorder the playlist',
        description:
          'Send every track id exactly once, in the order you want. Used for drag and drop reordering.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['order'],
                properties: {
                  order: { type: 'array', items: { type: 'integer' }, example: [2, 1, 3, 4, 5] }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'The playlist in its new order',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Track' } }
                  }
                }
              }
            }
          },
          400: errorResponse('Ids are missing, duplicated or unknown')
        }
      }
    },
    '/api/v1/tracks/{id}': {
      get: {
        tags: ['Tracks'],
        summary: 'Get one track',
        parameters: [idParam],
        responses: {
          200: trackResponse('The track'),
          400: errorResponse('Invalid id'),
          404: errorResponse('Track not found')
        }
      },
      put: {
        tags: ['Tracks'],
        summary: 'Edit a track',
        description: 'Replaces all editable fields. Sending the same request twice gives the same result.',
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/TrackInput' } }
          }
        },
        responses: {
          200: trackResponse('The updated track'),
          400: errorResponse('Validation error'),
          404: errorResponse('Track not found')
        }
      },
      delete: {
        tags: ['Tracks'],
        summary: 'Remove a track',
        parameters: [idParam],
        responses: {
          204: { description: 'Track removed' },
          400: errorResponse('Invalid id'),
          404: errorResponse('Track not found')
        }
      }
    },
    '/api/v1/tracks/{id}/star': {
      put: {
        tags: ['Stars'],
        summary: 'Star a track',
        description: 'Safe to call more than once, the track just stays starred.',
        parameters: [idParam],
        responses: {
          200: trackResponse('The starred track'),
          404: errorResponse('Track not found')
        }
      },
      delete: {
        tags: ['Stars'],
        summary: 'Remove the star from a track',
        parameters: [idParam],
        responses: {
          200: trackResponse('The track without a star'),
          404: errorResponse('Track not found')
        }
      }
    }
  },
  components: {
    schemas: {
      Track: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          position: { type: 'integer', description: 'Place in the playlist, starting from 1' },
          title: { type: 'string' },
          artist: { type: 'string' },
          album: { type: 'string' },
          length: { type: 'integer', description: 'Duration in seconds' },
          lengthText: { type: 'string', description: 'Duration as m:ss' },
          genre: { type: 'string' },
          cover: { type: 'string', description: 'Cover image URL' },
          starred: { type: 'boolean' }
        },
        example: trackExample
      },
      TrackInput: {
        type: 'object',
        required: ['title', 'artist', 'length'],
        properties: {
          title: { type: 'string' },
          artist: { type: 'string' },
          album: { type: 'string' },
          length: { type: 'integer', minimum: 1, description: 'Duration in seconds' },
          genre: { type: 'string', example: 'Pop' },
          cover: { type: 'string', description: 'Cover image URL' },
          starred: { type: 'boolean' }
        }
      },
      PageMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          totalItems: { type: 'integer' },
          totalPages: { type: 'integer' }
        }
      },
      Summary: {
        type: 'object',
        properties: {
          totalTracks: { type: 'integer', example: 5 },
          totalLength: { type: 'integer', example: 1046 },
          totalLengthText: { type: 'string', example: '17 min 26 sec' },
          starredCount: { type: 'integer', example: 3 }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: { message: { type: 'string', example: 'Track 99 not found' } }
          }
        }
      }
    }
  }
};
