const { buildTrack } = require('../models/track');

function loadSeedTracks() {
  return [
    buildTrack({
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      length: 212,
      genre: 'Pop',
      starred: true
    }),
    buildTrack({
      title: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      length: 220,
      genre: 'Pop'
    }),
    buildTrack({
      title: 'Watermelon Sugar',
      artist: 'Harry Styles',
      album: 'Fine Line',
      length: 214,
      genre: 'Pop',
      starred: true
    }),
    buildTrack({
      title: 'Save Your Tears',
      artist: 'The Weeknd',
      album: 'After Hours',
      length: 246,
      genre: 'R&B'
    }),
    buildTrack({
      title: 'Peaches',
      artist: 'Justin Bieber',
      album: 'Justice',
      length: 154,
      genre: 'Pop',
      starred: true
    })
  ];
}

module.exports = { loadSeedTracks };
