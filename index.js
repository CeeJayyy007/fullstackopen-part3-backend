require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");

const cors = require("cors");

morgan.token("type", function (req, res) {
  return JSON.stringify(req.body);
});

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

// add person
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (body.name === undefined) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  if (body.number === undefined) {
    return response.status(400).json({
      error: "number missing",
    });
  }

  //  validate that name is unique
  //   const existingName = persons.find((person) => person.name === name);

  //   if (existingName) {
  //     return response.status(400).json({ message: "name must be unique" });
  //   }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

// delete person
app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// handler of requests with unknown endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// add error handler middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// use error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
