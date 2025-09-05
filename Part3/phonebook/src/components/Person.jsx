import Contact from "./Contact";

const Person = ({ persons, handleDelete }) => {
  return (
    <>
      {persons.length === 0 ? (
        <p>No contacts found</p>
      ) : (
        <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
          {persons.map((person) => (
            <Contact
              key={person.id}
              name={person.name}
              number={person.number}
              onDelete={() => handleDelete(person.id)}
            />
          ))}
        </ul>
      )}
    </>
  );
};

export default Person;
