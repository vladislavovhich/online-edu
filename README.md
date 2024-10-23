# Online Learning Platform

A Node.js-based online learning platform built entirely with sockets. This project allows real-time interactions between students and instructors over HTTP via raw socket connections, without using any additional web frameworks like Express. The platform supports features like video streaming, quizzes, and assignments, making it a powerful tool for online education.

## Features

- **Real-time communication**: Provides real-time interactions between users over socket connections.
- **Video streaming**: Instructors can stream video content directly to students.
- **Quizzes and assignments**: Students can complete quizzes and submit assignments via the platform.
- **Multi-user support**: Capable of handling multiple users simultaneously through socket connections.
- **Customizable courses**: Instructors can create and manage their own course content.
- **Secure authentication**: User authentication is handled securely, with JWT (JSON Web Token) support for managing user sessions.

## Technologies Used

- **Node.js**: The core technology used for creating the server and handling sockets.
- **Sockets**: Used for communication between the server and clients, enabling real-time data transfer.
- **JWT**: Used for authentication and secure session management.
- **Raw HTTP Handling**: Direct handling of HTTP requests and responses through sockets without using Express or any other HTTP framework.
