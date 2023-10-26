const express = require("express");
const app = express();

app.use(express.json());

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

const PORT = 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
