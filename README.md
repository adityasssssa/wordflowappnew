# Dyslexia Pal 🌱

Dyslexia Pal is a mobile learning app built with **React Native** and **Expo**. It is designed to make reading and language practice feel more approachable, visual, and interactive.

The app includes reading practice, speech exercises, homework text scanning, and letter-based activities in one simple interface.

## Features

### 🎙️ Audio Quests
Practice reading sentences out loud across different difficulty levels.

- Record your voice directly in the app
- Compare your speech with the target sentence
- Retry words that were missed
- Track first-try answers, retries, and hints
- Uses speech-to-text for feedback

### 📚 Homework Reader
Take a picture of printed homework and turn it into readable text.

- Uses the device camera
- Extracts text from an image with OCR
- Displays the result in a clean reading view
- Supports the OpenDyslexic font option

### 🧩 Alphabet Arcade
An interactive letter and word activity designed to make practice more engaging.

### ✏️ Word Wizards
A space reserved for another word-learning activity. This section is currently a work in progress.

### 🔤 OpenDyslexic Mode
The home screen includes a toggle that switches supported text to the **OpenDyslexic** font.

### 🎯 Personal Goal
Users can save a learning goal on the home screen. The goal is stored locally on the device with AsyncStorage.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/adityasssssa/wordflowappnew.git
cd wordflowappnew
```

### 2. Install dependencies

Make sure you have **Node.js** and **npm** installed, then run:

```bash
npm install
```

### 3. Start the app

```bash
npm start
```

This starts the Expo development server.

From there you can:

- scan the QR code with a compatible mobile Expo setup
- press `i` to open the iOS simulator
- press `a` to open an Android emulator
- press `w` to try the web version

For the best experience, use a phone or mobile simulator because features such as the camera and microphone depend on device permissions.

---

## How to Use

1. Open the app and wait for the Dyslexia Pal home screen.
2. Use **Enable OpenDyslexic** if you prefer that font.
3. Set or update your personal learning goal.
4. Choose an activity:
   - **Audio Quests** for spoken reading practice
   - **Homework Reader** to scan printed text
   - **Alphabet Arcade** for letter-based practice
5. Allow microphone or camera access when the app asks for it.
6. Use the back controls to return to the home screen and try another activity.

---

## Tech Stack

- React Native
- Expo
- React Navigation
- AsyncStorage
- Expo AV
- Expo Image Picker
- OpenDyslexic
- Rev AI speech-to-text
- OCR.Space

---

## Project Structure

```text
App.js                 Main navigation and global font setting
HomeScreen.js          Home screen, goal, and activity menu
WordSpeechApp.js       Audio Quests
HomeworkHelperApp.js   Homework Reader / OCR
LetterPuzzleApp.js     Alphabet Arcade
assets/                Images, icons, and fonts
```

---

## Permissions

Some features require device permissions:

- **Microphone** — used by Audio Quests
- **Camera** — used by Homework Reader

If permission is denied, those features will not work until access is enabled in the device settings.

---

## API Configuration & Security

Audio Quests and Homework Reader rely on external speech-to-text and OCR services.

**Do not commit private API credentials to a public repository.**

For a production version, API credentials should be rotated and handled through a secure backend rather than being embedded in the mobile app source code.

---

## Current Status

Dyslexia Pal is an active student project and prototype. Some parts of the app are still being developed, including **Word Wizards**.

The goal of the project is to explore how accessible design, speech feedback, OCR, and interactive exercises can support reading practice in a more encouraging format.

---

## License

This project currently uses the license declared in `package.json`.
