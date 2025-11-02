import React from 'react';

const HomePage: React.FC = () => {
    return (
        <div>
            <h1>Welcome to the Stratus Electron App</h1>
            <p>This is the main page of the application.</p>
        </div>
    );
};

const AboutPage: React.FC = () => {
    return (
        <div>
            <h1>About</h1>
            <p>This application is built using Electron and React.</p>
        </div>
    );
};

export { HomePage, AboutPage };