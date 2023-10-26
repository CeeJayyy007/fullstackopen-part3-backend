const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(express.json());

// import morgan for logging
app.use(morgan("tiny"));

// persons data
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// get all persons
app.get("/api/persons", (request, response) => {
  response.json(persons);
});

// get person with id
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

// get locale time and convert to string
const getTorontoTimeISOString = () => {
  const now = new Date();
  const torontoTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Toronto" })
  );
  return torontoTime;
};

// get person count info
app.get("/api/info", (request, response) => {
  const personCount = persons.length;

  const message = `<p>Phonebook has info for ${personCount} people</p>`;
  const torontoTimeString = getTorontoTimeISOString();

  if (personCount) {
    response.send(`${message} ${torontoTimeString}`);
  } else {
    response.status(404).end();
  }
});

// generate random id
const generateId = () => {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// create new person record
app.post("/api/persons", (request, response) => {
  const { name, number } = request.body;

  // check for name
  if (!name) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  // check for number
  if (!number) {
    return response.status(400).json({
      error: "number missing",
    });
  }

  // validate that name is unique
  const existingName = persons.find((person) => person.name === name);

  if (existingName) {
    return response.status(400).json({ message: "name must be unique" });
  }

  // create person object
  const person = {
    name: name,
    number: number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

// delete person
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
