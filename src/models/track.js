let counter = 1;

function buildTrack({ title, artist, album, length, genre, cover, starred }) {
  return {
    id: counter++,
    title,
    artist,
    album: album || '',
    length,
    genre: genre || 'Other',
    cover: cover || '',
    starred: Boolean(starred),
    addedAt: new Date().toISOString()
  };
}

module.exports = { buildTrack };
