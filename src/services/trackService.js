const repo = require('../repositories/trackRepository');
const { buildTrack } = require('../models/track');
const { toTrackDto } = require('../dtos/trackDto');
const { InvalidInputError, MissingError } = require('../errors');

const SORT_KEYS = {
  position: null,
  title: 'title',
  artist: 'artist',
  length: 'length'
};

function checkInput(data) {
  if (!data || typeof data !== 'object') {
    throw new InvalidInputError('Request body is required');
  }
  if (typeof data.title !== 'string' || data.title.trim() === '') {
    throw new InvalidInputError('title is required');
  }
  if (typeof data.artist !== 'string' || data.artist.trim() === '') {
    throw new InvalidInputError('artist is required');
  }
  if (!Number.isInteger(data.length) || data.length <= 0) {
    throw new InvalidInputError('length must be a positive integer (seconds)');
  }
}

function positionOf(track) {
  return repo.all().indexOf(track) + 1;
}

function findOrThrow(id) {
  const track = repo.find(id);
  if (!track) {
    throw new MissingError(`Track ${id} not found`);
  }
  return track;
}

function list({ search, genre, starred, sort = 'position', dir = 'asc', page = 1, limit = 10 } = {}) {
  if (!(sort in SORT_KEYS)) {
    throw new InvalidInputError('sort must be one of: position, title, artist, length');
  }
  if (dir !== 'asc' && dir !== 'desc') {
    throw new InvalidInputError('dir must be asc or desc');
  }

  page = Number(page);
  limit = Number(limit);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new InvalidInputError('page must be >= 1 and limit must be between 1 and 100');
  }

  // remember each track's place in the playlist before filtering or sorting
  let rows = repo.all().map((track, index) => ({ track, position: index + 1 }));

  if (search) {
    const term = String(search).toLowerCase();
    rows = rows.filter(({ track }) =>
      [track.title, track.artist, track.album].some((text) => text.toLowerCase().includes(term))
    );
  }

  if (genre) {
    const wanted = String(genre).toLowerCase();
    rows = rows.filter(({ track }) => track.genre.toLowerCase() === wanted);
  }

  if (starred === 'true' || starred === true) {
    rows = rows.filter(({ track }) => track.starred);
  }

  const key = SORT_KEYS[sort];
  if (key) {
    rows.sort((a, b) => {
      const x = a.track[key];
      const y = b.track[key];
      const diff = typeof x === 'string' ? x.localeCompare(y) : x - y;
      return dir === 'desc' ? -diff : diff;
    });
  } else if (dir === 'desc') {
    rows.reverse();
  }

  const totalItems = rows.length;
  const start = (page - 1) * limit;
  const items = rows.slice(start, start + limit).map(({ track, position }) => toTrackDto(track, position));

  return {
    items,
    meta: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    }
  };
}

function getById(id) {
  const track = findOrThrow(id);
  return toTrackDto(track, positionOf(track));
}

function create(data) {
  checkInput(data);
  const track = buildTrack({
    title: data.title.trim(),
    artist: data.artist.trim(),
    album: data.album,
    length: data.length,
    genre: data.genre,
    cover: data.cover,
    starred: data.starred
  });
  repo.insert(track);
  return toTrackDto(track, positionOf(track));
}

// PUT replaces the whole track, so repeating the same call changes nothing
function replace(id, data) {
  findOrThrow(id);
  checkInput(data);
  const track = repo.modify(id, {
    title: data.title.trim(),
    artist: data.artist.trim(),
    album: data.album || '',
    length: data.length,
    genre: data.genre || 'Other',
    cover: data.cover || '',
    starred: Boolean(data.starred)
  });
  return toTrackDto(track, positionOf(track));
}

function remove(id) {
  findOrThrow(id);
  repo.destroy(id);
}

function setStar(id, value) {
  findOrThrow(id);
  const track = repo.modify(id, { starred: value });
  return toTrackDto(track, positionOf(track));
}

function reorder(order) {
  if (!Array.isArray(order)) {
    throw new InvalidInputError('order must be an array of track ids');
  }
  const current = repo.all();
  const unique = new Set(order);
  const sameSize = order.length === current.length && unique.size === current.length;
  const allKnown = order.every((id) => repo.find(id));
  if (!sameSize || !allKnown) {
    throw new InvalidInputError('order must contain every track id exactly once');
  }
  repo.setOrder(order.map((id) => repo.find(id)));
  return list({ limit: 100 }).items;
}

function getSummary() {
  const tracks = repo.all();
  const totalLength = tracks.reduce((sum, t) => sum + t.length, 0);
  const minutes = Math.floor(totalLength / 60);
  const seconds = totalLength % 60;
  return {
    totalTracks: tracks.length,
    totalLength,
    totalLengthText: `${minutes} min ${seconds} sec`,
    starredCount: tracks.filter((t) => t.starred).length
  };
}

module.exports = { list, getById, create, replace, remove, setStar, reorder, getSummary };
