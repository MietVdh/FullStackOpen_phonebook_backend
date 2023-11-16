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

app.get('/api/persons', (req, res) => {
  Person.find({})
  .then(result => {
    res.json(result);
  })

});

app.get('/info', (req, res) => {
    const date = new Date();
    res.send(`
    <p>Phonebook has info for ${Person.find({}).count()} people</p>
    <p>${date}</p>
    `);
});


app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
  .then(result => {
    res.status(204).end();
  })
  .catch(error => next(error));
});


app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, {new: true})
  .then(updatedPerson => {
    res.json(updatedPerson);
  })
  .catch(error => next(error));

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
  // if (Person.findOne({name: body.name})) {
  //   const person = Person.findOne({name: body.name});
  //   const id = person._id;
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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}


app.use(errorHandler);


const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
