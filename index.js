require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

app.use(cors());
app.use(express.static('dist'))
app.use(express.json());

morgan.token('body', function (req, res) {
  console.log(req.method);
  const body = {name: req.body.name, number: req.body.number};
  return req.method === "POST" ? JSON.stringify(body) : ""
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

// let phonebook = [
//     {
//       "id": 1,
//       "name": "Arto Hellas",
//       "number": "040-123456"
//     },
//     {
//       "id": 2,
//       "name": "Ada Lovelace",
//       "number": "39-44-5323523"
//     },
//     {
//       "id": 3,
//       "name": "Dan Abramov",
//       "number": "12-43-234345"
//     },
//     {
//       "id": 4,
//       "name": "Mary Poppendieck",
//       "number": "39-23-6423122"
//     }
// ];

const phonebook = Person.find({});


app.get('/api/persons', (req, res) => {
  Person.find({})
  .then(result => {
    res.json(result);
  })

});

app.get('/info', (req, res) => {
    const date = new Date();
    res.send(`
    <p>Phonebook has info for ${phonebook.length} people</p>
    <p>${date}</p>
    `);
});


app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    Person.findById(id).then(person => {
      response.json(person);
    })

});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = phonebook.find(p => p.id === id);

  if (person) {
    phonebook = phonebook.filter(p => p.id !== id);
    res.status(204).end()
  } else {
    res.status(404).end();
  }
});


app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name) {
    return res.status(400).json({
      error: 'Missing name'
    });
  }

  if (!body.number) {
    return res.status(400).json({
      error: 'Missing number'
    });
  }

  // Name must be unique
  // if (phonebook.find(p => p.name == body.name)) {
  //   return res.status(400).json({
  //     error: 'Name must be unique'
  //   });
  // }

  const person = new Person({
    name: body.name,
    number: body.number
  });

  // phonebook = phonebook.concat(person);
  person.save().then(savedPerson => {
    res.json(savedPerson);
  });

});


const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
