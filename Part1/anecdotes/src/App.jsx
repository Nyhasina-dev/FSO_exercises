import { useState } from "react";

const App = () => {
  const anecdotes = [
    "If it hurts, do it more often.",
    "Adding manpower to a late software project makes it later!",
    "The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    "Premature optimization is the root of all evil.",
    "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.",
    "Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when diagnosing patients.",
    "The only way to go fast, is to go well.",
  ];

  const [selected, setSelected] = useState(0);
  const [votes, setVotes] = useState({});

  const handleNext = () => {
    const randomNext = Math.floor(Math.random() * anecdotes.length);
    setSelected(randomNext);
  };

  const handleVote = () => {
    const updatedVotes = { ...votes };
    updatedVotes[selected] = (updatedVotes[selected] || 0) + 1;
    setVotes(updatedVotes);
  };
  // finding the top most voted anecdotes

  let topAnecdote = "";
  let topVotes = 0;

  for (let i = 0; i < anecdotes.length; i++) {
    const currentVotes = votes[i] || 0;
    if (currentVotes > topVotes) {
      topVotes = currentVotes;
      topAnecdote = anecdotes[i];
    }
  }

  return (
    <>
      <h1>Anecdote of the day</h1>
      <div>{anecdotes[selected]}</div>
      <button onClick={handleVote}>vote</button>
      <button onClick={handleNext}>Next anecdote</button>

      <h1>Anecdote with most votes</h1>
      {topVotes === 0 ? (
        <p> No vote yet</p>
      ) : (
        <>
          <p>{topAnecdote}</p>
          <p>
            this anecdote has {topVotes} {topVotes > 1 ? "votes" : "vote"}
          </p>
        </>
      )}
    </>
  );
};

export default App;
