require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");

const cors = require("cors");

morgan.token("type", function (req, res) {
  return JSON.stringify(req.body);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// models
const Person = require("./models/phonebook");

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :type")
);

// get all persons
app.get("/api/persons", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
