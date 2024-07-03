const express = require('express');
const path = require('path');
const fs = require('fs');
const dataBase = require('./db/db.json');

const PORT = process.env.PORT || 3001;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// API route to GET notes from db.json
app.get('/api/notes', (req, res) =>
    res.json(dataBase)
);

// GET Route for homepage
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, './public/index.html'))
);

// GET Route for notes page
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, './public/notes.html'))
);

// Wildcard route to direct users index.html
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, './public/index.html'))
);

// function to create new note
function createNewNote(body, notesArray = []) {
    const newNote = { ...body };

    // If notesArray is empty, initialize the first element as 0.
    if (notesArray.length === 0)
        notesArray.push(0);

    // Assign a unique id to the new note by using the value of the first element in notesArray.
    newNote.id = notesArray[0];

    // Increment the first element in notesArray to ensure the next note gets a unique id.
    notesArray[0]++;

    // Add the new note to the notesArray.
    notesArray.push(newNote);

    // Write the updated notesArray to the db.json file.
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify(notesArray, null, 2)
    );

    // Return the new note.
    return newNote;
};

// API route to add new post to db.json
app.post('/api/notes', (req, res) => {
    const newNote = createNewNote(req.body, dataBase);
    res.json(newNote);
});

// function to delete notes, 
function deleteNote(id, notesArray) {
     // loops through to retrieve current note
    for (let i = 0; i < notesArray.length; i++) {   
        let note = notesArray[i];
        // Checks if the id of the current note matches the id passed to the function
        // If a matching id is found, it remove the note by using splice(i, 1), removes one element at index i from the array
        if (note.id == id) {
            notesArray.splice(i, 1);
            // Updates the database
            fs.writeFileSync(
                path.join(__dirname, './db/db.json'),
                JSON.stringify(notesArray, null, 2)
            );
            break; // Breaks the loop
        }
    }
}

// API route to delete notes
app.delete('/api/notes/:id', (req, res) => {
    deleteNote(req.params.id, dataBase);
    res.json(true);
});

// Listen for connections
app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);
