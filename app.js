// app.js

const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Dl@#tSa02',
  database: 'music',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL!');
});

const commonStyles = `
  body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  h1, h3 {
    text-align: center;
    color: #ffcc00;
  }
  a {
    text-decoration: none;
    color: #ffcc00;
    font-weight: bold;
  }
  a:hover {
    text-decoration: underline;
  }
  footer {
    margin-top: 500px;
    text-align: bottom;
    color: #777777;
    font-size: 16px;
  }
`;

let userPlaylist = [];

// Homepage route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Welcome to the Music Curating System VibeVault</title>
        <style>
          ${commonStyles}
          body {
            background-image: url('/mic1.jpg');
            background-size: cover;
            background-position: center;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 150vh;
          }
          h1 {
            font-size: 50px;
            text-align: center;
            color: #ffcc00;
          }
          h3 {
            font-size: 18px;
            max-width: 600px;
            margin-top: 20px;
            line-height: 1.5;
            color: #666666
          }
          button {
            padding: 15px;
            margin: 30px;
            border: none;
            border-radius: 30px;
            background-color: #ffcc00;
            color: #333333;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease, color 0.3s ease;
          }
          button:hover {
            background-color: #555555;
            color: #ffcc00;
          }
          #loading-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000000;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          #loading-gif {
            width: 300px;
            height: 500px;
          }
          #unique-homepage-gif {
            width: 100px;
            position: absolute;
            top: 10px;
            left: 10px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
        </style>
      </head>
      <body>
        <div id="loading-overlay">
          <img src="/spiral.gif" alt="Loading" id="loading-gif">
        </div>
        <img src="/clef.gif" alt="VibeVault Animated Logo" id="unique-homepage-gif">
        <h1>Welcome to VibeVault</h1>
        <h3>Explore a curated collection of your favorite music. Discover new tunes and build your playlists with VibeVault.</h3>
        <button onclick="showLoadingGif()">Explore Music</button>
        <footer>... .- -- .- -. -.-- ..- .-.-.- / -.-</footer>

        <script>
          function showLoadingGif() {
            document.getElementById('loading-overlay').style.display = 'flex';
            setTimeout(function() {
              window.location.href = '/search-form';
            }, 3000);
          }
        </script>
      </body>
    </html>
  `);
});

// Search form route
app.get('/search-form', (req, res) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1999 }, (_, index) => 2000 + index);

  res.send(`
    <html>
      <head>
        <title>Music Curating System - Search</title>
        <style>
          ${commonStyles}
          body {
            background-image: url('/p.jpg');
            background-size: cover;
            background-position: center;
            color: #ffffff;
          }
          h1 {
            font-size: 200%;
          }
          form {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            padding: 00px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0);
            margin-top: 60px;
            margin-left: auto;
            margin-right: auto;
            width: 300px;
          }
          label {
            margin: 10px 0;
            color: #ffffff;
            font-size: 20px;
          }
          input, select, button {
            padding: 10px;
            margin: 5px;
            border: none;
            border-radius: 5px;
            background-color: black;
            color: #ffffff;
            font-size: 20px;
          }
          button {
            cursor: pointer;
            background-color: #555555;
          }
        </style>
      </head>
      <body>
        <h1>VibeVault</h1>
        <form action="/search" method="get">
          <label for="songSearchTerm">Search for a song:</label>
          <input type="text" id="songSearchTerm" name="song">
          
          <label for="artistSearchTerm">Search for an artist:</label>
          <input type="text" id="artistSearchTerm" name="artist">
          
          <label for="albumSearchTerm">Search for an album:</label>
          <input type="text" id="albumSearchTerm" name="album">
          
          <label for="genreSearchTerm">Search for a genre:</label>
          <input type="text" id="genreSearchTerm" name="genre">
          
          <label for="moodSearchTerm">Search for a mood:</label>
          <input type="text" id="moodSearchTerm" name="mood">
          
          <label for="yearOfRelease" style="color: #000000;">Year of Release:</label>
          <select id="yearOfRelease" name="year">
            <option value="">Select Year</option>
            ${yearOptions.map(year => `<option value="${year}">${year}</option>`).join('')}
          </select>

          <button type="submit">Search</button>
        </form>
        <button id="go-to-playlist" onclick="goToPlaylist()">Go to Playlist</button>
        <script>
          function goToPlaylist() {
            window.location.href = '/playlist';
          }
        </script>
      </body>
    </html>
  `);
});

// Search route
app.get('/search', (req, res) => {
  const songSearchTerm = req.query.song;
  const artistSearchTerm = req.query.artist;
  const albumSearchTerm = req.query.album;
  const genreSearchTerm = req.query.genre;
  const moodSearchTerm = req.query.mood;
  const yearOfRelease = req.query.year;

  let sql = `
    SELECT 
      a.SongID,
      a.SongName,
      Album,
      Artist,
      Genre,
      Mood,
      YearOfRelease,
      Playtime,
      SongLink
    FROM 
      table1 a
      INNER JOIN table2 b ON a.SongID = b.SongID
      INNER JOIN table3 c ON a.SongID = c.SongID
    WHERE 
      (a.SongName LIKE ? OR ? IS NULL) AND
      (a.Artist LIKE ? OR ? IS NULL) AND
      (a.Album LIKE ? OR ? IS NULL) AND
      (a.Genre LIKE ? OR ? IS NULL) AND
      (a.Mood LIKE ? OR ? IS NULL)`;

  const params = [
    `%${songSearchTerm}%`, !songSearchTerm,
    `%${artistSearchTerm}%`, !artistSearchTerm,
    `%${albumSearchTerm}%`, !albumSearchTerm,
    `%${genreSearchTerm}%`, !genreSearchTerm,
    `%${moodSearchTerm}%`, !moodSearchTerm
  ];

  if (yearOfRelease) {
    sql += ` AND (YearOfRelease = ? OR YearOfRelease IS NULL OR YearOfRelease = '')`;
    params.push(yearOfRelease);
  }

  const query = connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error executing query: ', err);
      return res.status(500).send('Internal Server Error');
    }

    const tableRows = results.map(song => {
      return `<tr>
        <td>${song.SongID}</td>
        <td>${song.SongName}</td>
        <td>${song.Artist}</td>
        <td>${song.Album}</td>
        <td>${song.Genre}</td>
        <td>${song.Mood}</td>
        <td>${song.YearOfRelease}</td>
        <td>${song.Playtime}</td>
        <td><a href="${song.SongLink}" target="_blank">Listen</a></td>
        <td><a href="/add-to-playlist?songID=${song.SongID}">Add to Playlist</a></td>
      </tr>`;
    });

    res.send(`
      <html>
        <head>
          <title>Music Curating System - Song Search Results</title>
          <style>
            ${commonStyles}
            body {
              background-color: black;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-top: 20px;
              color: #ffffff;
            }
            th, td {
              border: 1px solid #555555;
              text-align: left;
              padding: 10px;
            }
            th {
              background-color: #777777;
            }
            h2 {
              color:666666;
            }
          </style>
        </head>
        <body>
          <h1>Welcome to VibeVault</h1>
          <h2>Song Search Results</h2>
          <table>
            <thead>
              <tr>
                <th>Song ID</th>
                <th>Song Name</th>
                <th>Artist</th>
                <th>Album</th>
                <th>Genre</th>
                <th>Mood</th>
                <th>Year of Release</th>
                <th>Playtime</th>
                <th>Link</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows.join('')}
            </tbody>
          </table>
          <button id="go-to-playlist" onclick="goToPlaylist()">Go to Playlist</button>
          <script>
            function goToPlaylist() {
              window.location.href = '/playlist';
            }
          </script>
        </body>
      </html>
    `);
  });
});

// Add to playlist route
app.get('/add-to-playlist', (req, res) => {
  const songID = req.query.songID;

  const sql = `SELECT a.SongID,a.SongName,Artist,Album,Genre,Mood,YearOfRelease,Playtime,SongLink FROM table1 a 
  inner join table2 b on a.SongID=b.SongID
  inner join table3 c on b.SongID=c.SongID
   WHERE a.SongID = ?`;
  connection.query(sql, [songID], (err, results) => {
    if (err) {
      console.error('Error fetching song details: ', err);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length === 0) {
      console.error('Song not found');
      return res.status(404).send('Song not found');
    }

    const song = results[0];

    userPlaylist.push(song);

    res.redirect('/');
  });
});

// Playlist route
app.get('/playlist', (req, res) => {
  const tableRows = userPlaylist.map(song => {
    return `<tr>
      <td>${song.SongID}</td>
      <td>${song.SongName}</td>
      <td>${song.Artist}</td>
      <td>${song.Album}</td>
      <td>${song.Genre}</td>
      <td>${song.Mood}</td>
      <td>${song.YearOfRelease}</td>
      <td>${song.Playtime}</td>
      <td><a href="${song.SongLink}" target="_blank">Listen</a></td>
      <td><a href="/delete-from-playlist?songID=${song.SongID}">Delete</a></td>
    </tr>`;
  });

  res.send(`
    <html>
      <head>
        <title>My Playlist</title>
        <style>
          ${commonStyles}
          body {
            background-color: black;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
            color: #ffffff;
          }
          th, td {
            border: 1px solid #555555;
            text-align: left;
            padding: 10px;
          }
          th {
            background-color: #777777;
          }
          h2 {
            color:666666;
          }
          button {
            padding: 15px;
            margin: 30px;
            border: none;
            border-radius: 30px;
            background-color: #ffcc00;
            color: #333333;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease, color 0.3s ease;
          }
          button:hover {
            background-color: #555555;
            color: #ffcc00;
          }
        </style>
      </head>
      <body>
        <h1>My Playlist</h1>
        <table>
          <thead>
            <tr>
              <th>Song ID</th>
              <th>Song Name</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Genre</th>
              <th>Mood</th>
              <th>Year of Release</th>
              <th>Playtime</th>
              <th>Link</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody> 
            ${tableRows.join('')}
          </tbody>
        </table>
        <button id="go-to-search" onclick="goToSearchForm()">Go to Search Form</button>
        <script>
          function goToSearchForm() {
            window.location.href = '/search-form';
          }
        </script>
      </body>
    </html>
  `);
});

// Delete from playlist route
app.get('/delete-from-playlist', (req, res) => {
  const songID = req.query.songID;

  console.log('Attempting to delete song with ID:', songID);
  console.log('Current playlist:', userPlaylist);

  const index = userPlaylist.findIndex(song => song.SongID === parseInt(songID));

  if (index !== -1) {
    userPlaylist.splice(index, 1);
    console.log('Song deleted. Updated playlist:', userPlaylist);
    res.redirect('/playlist');
  } else {
    console.error('Song not found in the playlist');
    res.status(404).send('Song not found in the playlist');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
