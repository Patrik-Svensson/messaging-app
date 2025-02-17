"use client"

import React, { useState } from 'react';

const Home = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3001/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            login(username: "${username}", password: "${password}") {
              username
            }
          }
        `,
      }),
    });

    const data = await response.json();

    if (data?.data?.login?.username) {
      localStorage.setItem('username', username);

      window.location.href = '/messages';
    } else {
      setErrorMessage('Login failed. Please check your username and password.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl mb-4 text-gray-800">Login</h2>
        {errorMessage && <label className="text-red-500">{errorMessage}</label>}
        <div className="mb-4">
          <label className="block text-gray-700 text-lg">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded p-2 text-lg text-black"
            required
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-lg">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded p-2 text-lg text-black"
            required
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default Home;
