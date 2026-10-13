const repo = require('../repositories/songRepository');
const { createSong } = require('../models/song');
const { toSongDto } = require('../dtos/songDto');
const { BadRequestError, NotFoundError } = require('../errors');

const SORT_FIELDS = {
  position: null,
  title: 'title',
  artist: 'artist',
  duration: 'durationSeconds'
};

function validateSongInput(data) {
  if (!data || typeof data !== 'object') {
    throw new BadRequestError('Request body is required');
  }
  if (typeof data.title !== 'string' || data.title.trim() === '') {
    throw new BadRequestError('title is required');
  }
  if (typeof data.artist !== 'string' || data.artist.trim() === '') {
    throw new BadRequestError('artist is required');
  }
  if (!Number.isInteger(data.durationSeconds) || data.durationSeconds <= 0) {
    throw new BadRequestError('durationSeconds must be a positive integer');
  }
}

function positionOf(song) {
  return repo.getAll().indexOf(song) + 1;
}

function findOrFail(id) {
  const song = repo.getById(id);
  if (!song) {
    throw new NotFoundError(`Song ${id} not found`);
  }
  return song;
}

function list({ q, genre, favorite, sortBy = 'position', order = 'asc', page = 1, limit = 10 } = {}) {
  if (!(sortBy in SORT_FIELDS)) {
    throw new BadRequestError('sortBy must be one of: position, title, artist, duration');
  }
  if (order !== 'asc' && order !== 'desc') {
    throw new BadRequestError('order must be asc or desc');
  }

  page = Number(page);
  limit = Number(limit);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new BadRequestError('page must be >= 1 and limit must be between 1 and 100');
  }

  // keep the playlist position before filtering/sorting
  let result = repo.getAll().map((song, index) => ({ song, position: index + 1 }));

  if (q) {
    const term = String(q).toLowerCase();
    result = result.filter(({ song }) =>
      [song.title, song.artist, song.album].some((field) => field.toLowerCase().includes(term))
    );
  }

  if (genre) {
    const g = String(genre).toLowerCase();
    result = result.filter(({ song }) => song.genre.toLowerCase() === g);
  }

  if (favorite === 'true' || favorite === true) {
    result = result.filter(({ song }) => song.isFavorite);
  }

  const field = SORT_FIELDS[sortBy];
  if (field) {
    result.sort((a, b) => {
      const x = a.song[field];
      const y = b.song[field];
      const cmp = typeof x === 'string' ? x.localeCompare(y) : x - y;
      return order === 'desc' ? -cmp : cmp;
    });
  } else if (order === 'desc') {
    result.reverse();
  }

  const totalItems = result.length;
  const start = (page - 1) * limit;
  const items = result.slice(start, start + limit).map(({ song, position }) => toSongDto(song, position));

  return {
    items,
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit)
  };
}

function getById(id) {
  const song = findOrFail(id);
  return toSongDto(song, positionOf(song));
}

function create(data) {
  validateSongInput(data);
  const song = createSong({
    title: data.title.trim(),
    artist: data.artist.trim(),
    album: data.album,
    durationSeconds: data.durationSeconds,
    genre: data.genre,
    coverUrl: data.coverUrl,
    isFavorite: data.isFavorite
  });
  repo.add(song);
  return toSongDto(song, positionOf(song));
}


function update(id, data) {
  findOrFail(id);
  validateSongInput(data);
  const song = repo.update(id, {
    title: data.title.trim(),
    artist: data.artist.trim(),
    album: data.album || '',
    durationSeconds: data.durationSeconds,
    genre: data.genre || 'Other',
    coverUrl: data.coverUrl || '',
    isFavorite: Boolean(data.isFavorite)
  });
  return toSongDto(song, positionOf(song));
}

function remove(id) {
  findOrFail(id);
  repo.remove(id);
}

function setFavorite(id, value) {
  findOrFail(id);
  const song = repo.update(id, { isFavorite: value });
  return toSongDto(song, positionOf(song));
}

function reorder(ids) {
  if (!Array.isArray(ids)) {
    throw new BadRequestError('ids must be an array');
  }
  const current = repo.getAll();
  const unique = new Set(ids);
  const sameSize = ids.length === current.length && unique.size === current.length;
  const allKnown = ids.every((id) => repo.getById(id));
  if (!sameSize || !allKnown) {
    throw new BadRequestError('ids must contain every song id exactly once');
  }
  repo.replaceOrder(ids.map((id) => repo.getById(id)));
  return list({ limit: 100 }).items;
}

function getSummary() {
  const songs = repo.getAll();
  const totalSeconds = songs.reduce((sum, s) => sum + s.durationSeconds, 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    totalSongs: songs.length,
    totalDurationSeconds: totalSeconds,
    totalDuration: `${minutes} min ${seconds} sec`,
    favoriteCount: songs.filter((s) => s.isFavorite).length
  };
}

module.exports = { list, getById, create, update, remove, setFavorite, reorder, getSummary };