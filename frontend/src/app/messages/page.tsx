"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, gql, useApolloClient } from '@apollo/client';

const GET_USERS = gql`
  query getUsersExcluding($username: String!) {
    getUsersExcluding(username: $username) {
      id
      username
    }
  }
`;

const CREATE_THREAD = gql`
  mutation CreateThread($title: String!, $participants: [String!]!) {
    createThread(title: $title, participants: $participants) {
      id
      title
      participants {
        username
      }
    }
  }
`;

const ADD_MESSAGE = gql`
  mutation addMessage($threadId: String!, $message: String!, $username: String!) {
    addMessage(threadId: $threadId, message: $message, username: $username) {
      id
      messages {
        id
        text
        timestamp
        author {
          username
        }
      }
    }
  }
`;


const GET_THREADS = gql`
  query getThreads($username: String!) {
    getThreads(username: $username) {
      id
      title
      participants {
        username
      }
      messages {
        id
        text
        timestamp
        author {
            username
        }
      }
    }
  }
`;

interface User {
    id: string;
    username: string;
}

interface Message {
    id: string;
    text: string;
    timestamp: string;
    author: User
}

interface Thread {
    id: string;
    title: string;
    participants: User[];
    messages: Message[];
}

const MessageDashboard = () => {
    const router = useRouter();
    const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null; 
    const { loading: usersLoading, error: usersError, data: usersData } = useQuery(GET_USERS, {
        variables: {
            username: username
        }
    });
    const [input, setInput] = useState<string>('');
    const [activeThread, setActiveThread] = useState<string>('1');
    const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [threadTitle, setThreadTitle] = useState('');
    const client = useApolloClient();
    const [threads, setThreads] = useState<Thread[]>([]);

    const users = usersData?.getUsersExcluding || [];

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const { data } = await client.query({
                    query: GET_THREADS,
                    variables: { username },
                });

                setThreads(data.getThreads);
            } catch (error) {
                console.error('Error fetching threads:', error);
            }
        };

        fetchThreads();
    }, [client, username]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setInput('');
        router.push('/');
    };

    const sendMessage = async () => {
        if (input.trim() && activeThread) {
            try {
                const { data } = await client.mutate({
                    mutation: ADD_MESSAGE,
                    variables: {
                        threadId: activeThread,
                        message: input,
                        username: username,
                    }
                });
    
                setThreads(prevThreads => 
                    prevThreads.map(thread => 
                        thread.id === activeThread 
                            ? { ...thread, messages: data.addMessage.messages }
                            : thread
                    )
                );
                
    
                setInput('');
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    };
    

    const handleCreateThread = async () => {
        try {
            const { data } = await client.mutate({
                mutation: CREATE_THREAD,
                variables: {
                    title: threadTitle,
                    participants: [...selectedUsers, username],
                }
            });
            
            window.location.reload();
            
        } catch (error) {
            console.error('Error creating thread:', error);
        }

        setIsNewThreadModalOpen(false);
        setSelectedUsers([]);
        setThreadTitle('');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-80 bg-white border-r border-gray-200">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-black">Chats</h2>
                    <button
                        onClick={() => setIsNewThreadModalOpen(true)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                        New Chat
                    </button>
                </div>
                <div className="overflow-y-auto">
                    {threads.map((thread: Thread) => (
                        <div
                            key={thread.id}
                            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                                activeThread === thread.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => setActiveThread(thread.id)}
                        >
                            <div className="flex flex-col gap-1">
                                <h3 className="font-medium text-black">{thread.title}</h3>
                                <p className="text-sm text-gray-500">
                                    {thread.participants && thread.participants.length > 0 
                                        ? users.filter(user => thread.participants.includes(user.id)).map(user => user.username).join(', ')
                                        : 'No participants'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                <header className="p-4 border-b border-gray-200 bg-white flex flex-col">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl text-black font-semibold">
                            {threads.find((t: Thread) => t.id === activeThread)?.title}
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                    <div className="text-sm text-gray-500">
                        Participants: {threads.find((t: Thread) => t.id === activeThread)?.participants.map(participant => participant.username).join(', ')}
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4">
                    {threads.find((t: Thread) => t.id === activeThread)?.messages
                        .slice()
                        .sort((a: Message, b: Message) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) 
                        .map((msg: Message) => (
                            <div 
                                key={msg.id} 
                                className={`p-3 rounded-lg shadow mb-2 max-w-[80%] ${msg.author.username === username ? 'bg-blue-700 ml-auto' : 'bg-white text-black'}`}
                            >
                                {msg.text}
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
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-black"
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

            {isNewThreadModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h2 className="text-xl text-black font-semibold mb-4">Create New Chat</h2>
                        <input
                            type="text"
                            value={threadTitle}
                            onChange={(e) => setThreadTitle(e.target.value)}
                            placeholder="Chat title..."
                            className="w-full p-2 border border-gray-300 rounded-lg mb-4 text-black"
                        />
                        <div className="mb-4">
                            <h3 className="text-sm text-black font-medium mb-2">Select Users:</h3>
                            <div className="max-h-48 overflow-y-auto">
                                {users.map((user: User) => (
                                    <label key={user.username} className="flex items-center gap-2 p-2 hover:bg-gray-50 text-black">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.username)}
                                            onChange={(e) => {
                                                setSelectedUsers(prevSelectedUsers => {
                                                    if (e.target.checked) {
                                                        return [...prevSelectedUsers, user.username];
                                                    } else {
                                                        return prevSelectedUsers.filter(username => username !== user.username);
                                                    }
                                                });
                                            }}
                                        />
                                        {user.username}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsNewThreadModalOpen(false);
                                    setSelectedUsers([]);
                                    setThreadTitle('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateThread}
                                disabled={!threadTitle.trim() || selectedUsers.length === 0}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageDashboard;
