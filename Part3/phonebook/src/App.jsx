import { useState, useEffect } from "react";
import personService from "./services/persons";
import PersonForm from "./components/PersonForm";
import Person from "./components/Person";
import Filter from "./components/Filter";
import Notification from "./components/Notification";
const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState({ text: null, type: null });

  useEffect(() => {
    personService.getAll().then((initialPerson) => {
      setPersons(initialPerson);
    });
  }, []);

  const handleFilter = (event) => {
    setFilter(event.target.value);
  };
  const handleName = (event) => {
    setNewName(event.target.value);
  };
  const handleNumber = (event) => {
    setNewNumber(event.target.value);
  };

  const handleDelete = (id) => {
    const person = persons.find((n) => n.id === id);

    if (window.confirm(`Delete ${person.name}`)) {
      personService.remove(id).then(() => {
        setPersons(persons.filter((p) => p.id !== id));
      });
    }
  };

  const addContact = (event) => {
    event.preventDefault();

    const existingPerson = persons.find(
      (person) => person.name.toLowerCase() === newName.toLowerCase()
    );

    const newContact = {
      name: newName,
      number: newNumber,
    };

    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${existingPerson.name} is already added to phonebook. Replace the old number with the new one?`
      );

      if (confirmUpdate) {
        personService
          .update(existingPerson.id, newContact)
          .then((updatedPerson) => {
            setPersons(
              persons.map((p) =>
                p.id !== existingPerson.id ? p : updatedPerson
              )
            );
            setMessage({
              text: `Updated ${updatedPerson.name}`,
              type: "success",
            });
            setTimeout(() => {
              setMessage({ text: null, type: null });
            }, 5000);
            setNewName("");
            setNewNumber("");
          })
          .catch((error) => {
            setMessage({
              text: `Information of ${existingPerson.name} has already been removed from the server`,
              type: "error",
            });
            setTimeout(() => {
              setMessage({ text: null, type: null });
            }, 5000);
            setPersons(persons.filter((p) => p.id !== existingPerson.id));
          });
        setNewName("");
        setNewNumber("");

        return;
      }
      return;
    }

    personService
      .create(newContact)
      .then((returnedData) => {
        setPersons(persons.concat(returnedData));
        setMessage({
          text: `Added ${returnedData.name}`,
          type: "success",
        });
        setTimeout(() => {
          setMessage({ text: null, type: null });
        }, 5000);
        setNewName("");
        setNewNumber("");
      })
      .catch((error) => {
        setMessage({
          text: error.response.data.error,
          type: "error",
        });
        setTimeout(() => {
          setMessage({ text: null, type: null });
        }, 5000);
      });
  };

  const personsToShow = persons.filter(
    (person) =>
      person.name && person.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message.text} type={message.type} />
      <Filter filter={filter} onChange={handleFilter} />
      <h2>add a new</h2>
      <PersonForm
        onSubmit={addContact}
        newName={newName}
        newNumber={newNumber}
        handleName={handleName}
        handleNumber={handleNumber}
      />
      <h2>Numbers</h2>
      <Person persons={personsToShow} handleDelete={handleDelete} />
    </div>
  );
};

export default App;
