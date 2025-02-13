"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Thread {
    id: number;
    name: string;
    lastMessage: string;
    unread?: number;
}

const MessageDashboard = () => {
    const router = useRouter();
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState<string>('');
    const [threads, setThreads] = useState<Thread[]>([
        { id: 1, name: 'John Doe', lastMessage: 'Hey there!', unread: 2 },
        { id: 2, name: 'Jane Smith', lastMessage: 'See you tomorrow', unread: 0 },
        { id: 3, name: 'Team Chat', lastMessage: 'Meeting at 3pm', unread: 5 },
    ]);
    const [activeThread, setActiveThread] = useState<number>(1);

    const handleLogout = () => {
        // Remove JWT from localStorage
        localStorage.removeItem('token');
        
        // Clear any user-related state
        setMessages([]);
        setThreads([]);
        setInput('');
        
        // Redirect to homepage
        router.push('/');
    };

    const sendMessage = () => {
        if (input.trim()) {
            setMessages([...messages, input]);
            setInput('');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-80 bg-white border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-black">Chats</h2>
                </div>
                <div className="overflow-y-auto">
                    {threads.map((thread) => (
                        <div
                            key={thread.id}
                            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                                activeThread === thread.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => setActiveThread(thread.id)}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="font-medium text-black">{thread.name}</h3>
                                {thread.unread > 0 && (
                                    <span className="bg-blue-500 text-black text-xs px-2 py-1 rounded-full">
                                        {thread.unread}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-black mt-1">{thread.lastMessage}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                <header className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                    <h1 className="text-xl text-black font-semibold">
                        {threads.find(t => t.id === activeThread)?.name}
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Logout
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.map((msg, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg shadow mb-2 max-w-[80%]">
                            {msg}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 p-2 border border-gray-300 rounded-lg"
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button 
                            onClick={sendMessage}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageDashboard;
