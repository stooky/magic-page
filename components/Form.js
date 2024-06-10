// components/Form.js
import { useState } from 'react';

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "Parallel lines have so much in common. It’s a shame they’ll never meet.",
  "My wife accused me of being immature. I told her to get out of my fort.",
  "Why don't skeletons fight each other? They don't have the guts.",
  "What do you call cheese that isn't yours? Nacho cheese.",
  "Why couldn't the bicycle stand up by itself? It was two tired.",
  "I'm reading a book on anti-gravity. It's impossible to put down!",
  "Want to hear a joke about construction? I’m still working on it.",
  "What do you get when you cross a snowman with a vampire? Frostbite."
];

export default function Form() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [joke, setJoke] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setJoke(jokes[Math.floor(Math.random() * jokes.length)]);
      setLoading(false);
    }, 3000);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <label htmlFor="website">Website URL:</label>
        <input
          type="url"
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          required
        />
        <br />
        <button type="submit">Build my AI Employee</button>
      </form>
      {loading && <img src="/spinner.gif" alt="Loading..." />}
      {joke && <p>{joke}</p>}
    </div>
  );
}
