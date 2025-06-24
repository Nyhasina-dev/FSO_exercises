const PersonForm = ({
  onSubmit,
  newName,
  newNumber,
  handleName,
  handleNumber,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        name: <input required value={newName} onChange={handleName} />
      </div>
      <div>
        number: <input required value={newNumber} onChange={handleNumber} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

export default PersonForm;
