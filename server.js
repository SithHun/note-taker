const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static('public'));

// Route for the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Route for the notes page
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// Route for all other routes
app.get('*', (req, res) => {
  res.sendFile(__dirname, '/public/index.html');
});

// Route to handle saving a new note
app.post('/api/notes', (req, res) => {
  const newNote = {
    id: uuidv4(),
    title: req.body.title,
    text: req.body.text,
  };

  const notes = getNotesFromDb();
  const updatedNotes = [...notes, newNote];

  saveNotesToDb(updatedNotes);

  res.json(newNote);
});

// Route to handle deleting a note
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const notes = getNotesFromDb();
  const updatedNotes = notes.filter((note) => note.id !== noteId);

  saveNotesToDb(updatedNotes);

  res.sendStatus(204);
});

// Route to get all notes
app.get('/api/notes', (req, res) => {
  const notes = getNotesFromDb();
  res.json(notes);
});

// Helper function to read notes from db.json file
const getNotesFromDb = () => {
  const data = fs.readFileSync(path.join(__dirname, 'db', 'db.json'), 'utf-8');
  return JSON.parse(data);
};

// Helper function to write notes to db.json file
const saveNotesToDb = (notes) => {
  if (notes.length === 0) {
    fs.writeFileSync(path.join(__dirname, 'db', 'db.json'), '[]', 'utf-8');
  } else {
    fs.writeFileSync(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes), 'utf-8');
  }
};

// Start the server
const port = process.env.PORT || 3001; // Change this if needed
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});