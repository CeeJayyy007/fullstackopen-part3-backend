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
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
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
app.get("/api/info", (request, response, next) => {
  Person.find({})
    .then((people) => {
      personCount = people.length;
      const message = `<p>Phonebook has info for ${personCount} people</p>`;
      const torontoTimeString = getTorontoTimeISOString();
      if (personCount) {
        response.send(`${message} ${torontoTimeString}`);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// update person record
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// add person
app.post("/api/persons", (request, response, next) => {
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

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

// delete person
app.delete("/api/persons/:id", (request, response, next) => {
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
