# Collaboration Guide for Sri Balaji Traders

Welcome to the team! Here is how to get the project running on your machine.

## 1. Prerequisites
Before you start, make sure you have these installed:
- [Node.js](https://nodejs.org/) (Download the LTS version)
- [VS Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/downloads)

## 2. Clone the Repository
Open your terminal (or Command Prompt) and run:
```sh
git clone https://github.com/Vinay50029/sri-balaji-rice-website.git
cd sri-balaji-rice-website
```

## 3. Install Dependencies
Install the required libraries by running:
```sh
npm install
```

## 4. Environment Variables (.env)
**Important:** This project uses Firebase and needs API keys to work. These keys are hidden from GitHub for security.
* Ask Vinay to send you the `.env` file.
* Place this `.env` file inside the `sri-balaji-rice-website` folder (same level as `package.json`).

## 5. Run the Project
To start the website locally:
```sh
npm run dev
```
Open the link shown (usually `http://localhost:5173`) in your browser.

## 6. Making Changes (Git Workflow)
When you want to change something:
1. **Get latest code:** `git pull origin main`
2. **Make your changes** in VS Code.
3. **Save** your changes:
   ```sh
   git add .
   git commit -m "Describe what you changed"
   git push origin main
   ```
