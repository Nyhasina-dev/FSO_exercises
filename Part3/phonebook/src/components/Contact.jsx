const Contact = ({ name, number, onDelete }) => {
  return (
    <li>
      {name} {number}
      <button onClick={onDelete}>Delete</button>
    </li>
  );
};

export default Contact;
