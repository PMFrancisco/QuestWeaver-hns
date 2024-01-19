# Quest Weaver

## Description

This project is a virtual tabletop for role-playing games (RPGs), providing a digital platform for gamers to create and play their tabletop adventures. It facilitates game management, character interaction, and map visualization, enhancing the RPG experience in a digital environment.
## Features

- **Game Creation:** Easily create new RPG game sessions, providing essential details such as game name, description, and game master.

- **Maps:** Create and manage virtual maps for your tabletop role-playing game (RPG) sessions, allowing game masters to design custom game worlds, dungeons, and environments.

- **Wiki:** Collaboratively document game lore, character information, and campaign details using the built-in wiki feature. It serves as a valuable resource for both players and game masters.

## Installation

Follow these steps to get your development environment up and running:

1. Clone the repository:
```bash
git clone https://your-repository-link.git
2. Change to the project directory:
cd QuestWeaver
3. Install the required dependencies:
npm install
```

## Usage

To use this application, follow these steps:

1. Start the application by running the following command:
   ```bash
   npm start

## API Documentation

You can find the full API documentation [here]([https://example.com/api/docs](https://questweaver.onrender.com/api-docs/)).

This documentation provides detailed information about the available API endpoints, request methods, and response formats. It's a valuable resource for developers who want to integrate with our API.


## Configuration

Before running the project, you need to set up some configuration options. These options can be configured through environment variables. Here's what you need to know:

### Environment Variables

- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name for storing images and media.
- `CLOUDINARY_API_KEY`: Your Cloudinary API key for authentication.
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret key.
- `GOOGLE_CLIENT_ID`: Your Google OAuth2 client ID for authentication.
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth2 client secret.
- `DATABASE_URL`: The URL of your database, including credentials.
- `SESSION_SECRET`: A secret key for managing user sessions.
- `GMAIL_USER`: Your Gmail email address for sending emails.
- `GMAIL_PASS`: Your Gmail email password.
  
Make sure to create a `.env` file in the project root directory and set these environment variables with their respective values.

```plaintext
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret
GMAIL_USER=your_gmail_email
GMAIL_PASS=your_gmail_password
```


## Tests

Describe how to run the automated tests for this system.

```bash
npm test
```

## Versioning

We use [Semantic Versioning](https://semver.org/) (SemVer) for versioning this project. SemVer helps us convey the significance of changes in our codebase to users and developers.

The version number is composed of three segments: `MAJOR.MINOR.PATCH`.

- **MAJOR** version increments indicate significant, potentially breaking changes to the project. These may include backward-incompatible API changes, major new features, or major refactoring.

- **MINOR** version increments represent smaller, backward-compatible additions or enhancements to the project. These may include new features or improvements.

- **PATCH** version increments signify backward-compatible bug fixes or minor improvements that don't introduce new features.

Additionally, we use pre-release versions (e.g., `1.0.0-alpha.1`) to indicate that a version is in development and may not be stable for production use. Pre-release versions help us iterate and gather feedback while clearly communicating the project's status.

You can find a detailed history of changes in the [CHANGELOG.md](CHANGELOG.md) file, where each release is documented with release notes, including changes, bug fixes, and any breaking changes.

We encourage users and contributors to adhere to SemVer principles when suggesting or implementing changes, making it easier to understand the impact of updates to the project.


## Authors

- **Francisco Pérez** - _Initial work_ - [PMFrancisco](https://github.com/PMFrancisco)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

### Notes:

- **Project Name**: Quest Weaver.
- **Repository Link**: [Github Repository](https://github.com/PMFrancisco/QuestWeaver).
- **Your Name and YourUsername**: Francisco Pérez, PMFrancisco.
