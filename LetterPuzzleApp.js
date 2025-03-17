// LetterPuzzleApp.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ScrollView,
  ActivityIndicator,
  SafeAreaView 
} from 'react-native';
import * as Font from 'expo-font';
import { Audio } from 'expo-av';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts, NerkoOne_400Regular } from '@expo-google-fonts/nerko-one';
import { FontContext } from './App';

const dyslexicScale = 0.76;

const Stack = createStackNavigator();

const questions = [
  { image: require('./assets/images/house.jpg'), audio: require('./assets/audio/house.mp3'), answer: "house" },
  { image: require('./assets/images/lamp.jpg'), audio: require('./assets/audio/lamp.mp3'), answer: "lamp" },
  { image: require('./assets/images/water.jpg'), audio: require('./assets/audio/water.mp3'), answer: "water" },
  { image: require('./assets/images/purse.jpg'), audio: require('./assets/audio/purse.mp3'), answer: "purse" },
  { image: require('./assets/images/plant.jpg'), audio: require('./assets/audio/plant.mp3'), answer: "plant" },
  { image: require('./assets/images/snow.jpg'), audio: require('./assets/audio/snow.mp3'), answer: "snow" },
  { image: require('./assets/images/truck.jpg'), audio: require('./assets/audio/truck.mp3'), answer: "truck" },
];

const letterImageMapping = {
  a: require('./assets/letters/a.jpg'),
  c: require('./assets/letters/c.jpg'),
  e: require('./assets/letters/e.jpg'),
  h: require('./assets/letters/h.jpg'),
  k: require('./assets/letters/k.jpg'),
  l: require('./assets/letters/l.jpg'),
  m: require('./assets/letters/m.jpg'),
  n: require('./assets/letters/n.jpg'),
  o: require('./assets/letters/o.jpg'),
  p: require('./assets/letters/p.jpg'),
  r: require('./assets/letters/r.jpg'),
  s: require('./assets/letters/s.jpg'),
  t: require('./assets/letters/t.jpg'),
  u: require('./assets/letters/u.jpg'),
  w: require('./assets/letters/w.jpg'),
};

function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Updated CustomHeader with fixed title font (always NerkoOne)
const CustomHeader = ({ navigation, showBack = true }) => {
  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIconContainer}
        >
          <Ionicons name="arrow-back-circle-outline" size={38} color="grey" />
        </TouchableOpacity>
      )}
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>
          Dyslexia Pal
        </Text>
      </View>
      {showBack && <View style={styles.headerRightPlaceholder} />}
    </View>
  );
};

function PuzzleScreen({ navigation }) {
  const { useDyslexic } = useContext(FontContext);

  // Hint toggle and counter state (only one hint counted per question)
  const [hintActive, setHintActive] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintUsedForCurrentQuestion, setHintUsedForCurrentQuestion] = useState(false);
  const hintButtonLabel = hintActive ? "Hint Shown" : "Hint";
  const handleHint = () => {
    if (!hintUsedForCurrentQuestion) {
      setHintsUsed(prev => prev + 1);
      setHintUsedForCurrentQuestion(true);
    }
    setHintActive(!hintActive);
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];
  const targetWord = currentQuestion.answer;
  const letters = targetWord.split("");

  const [availableLetters, setAvailableLetters] = useState(shuffleArray(letters));
  const [dropZones, setDropZones] = useState(new Array(targetWord.length).fill(""));

  const [firstAttemptCorrect, setFirstAttemptCorrect] = useState(null);
  const [firstAttemptScore, setFirstAttemptScore] = useState(0);

  const [audioPlaying, setAudioPlaying] = useState(false);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        'OpenDyslexic': require('./assets/fonts/OpenDyslexic-Regular.otf'),
      });
    }
    loadFont();
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  }, []);

  useEffect(() => {
    playAudio();
    resetPuzzle();
    setFirstAttemptCorrect(null);
    setHintActive(false);
    setHintUsedForCurrentQuestion(false);
  }, [currentQuestionIndex]);

  const playAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(currentQuestion.audio);
      setSound(newSound);
      setAudioPlaying(true);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setAudioPlaying(false);
        }
      });
    } catch (error) {
      console.error("Audio playback error:", error);
      Alert.alert("Audio Error", "Unable to play the audio.");
    }
  };

  const handleTileTap = (letter) => {
    const nextIndex = dropZones.findIndex(item => item === "");
    if (nextIndex !== -1) {
      const newDropZones = [...dropZones];
      newDropZones[nextIndex] = letter;
      setDropZones(newDropZones);
      setAvailableLetters(availableLetters.filter(l => l !== letter));
    }
  };

  const handleDropZoneTap = (index) => {
    if (dropZones[index] !== "") {
      const removedLetter = dropZones[index];
      const newDropZones = [...dropZones];
      newDropZones[index] = "";
      setDropZones(newDropZones);
      setAvailableLetters(shuffleArray([...availableLetters, removedLetter]));
    }
  };

  const handleSubmit = () => {
    const formedWord = dropZones.join("");
    if (firstAttemptCorrect === null) {
      if (formedWord === targetWord) {
        const newScore = firstAttemptScore + 1;
        setFirstAttemptCorrect(true);
        setFirstAttemptScore(newScore);
        Alert.alert("Correct", "Your answer is correct!", [
          { text: "OK", onPress: () => nextQuestion(newScore) }
        ]);
      } else {
        setFirstAttemptCorrect(false);
        Alert.alert("Incorrect", "Your first attempt is incorrect. Please try again until you get it correct.");
      }
    } else {
      if (formedWord === targetWord) {
        Alert.alert(
          "Correct",
          "Your answer is now correct, but your first attempt was marked incorrect.",
          [{ text: "OK", onPress: () => nextQuestion(firstAttemptScore) }]
        );
      } else {
        Alert.alert("Incorrect", "Your answer is incorrect. Please try again.");
      }
    }
  };

  const resetPuzzle = () => {
    setAvailableLetters(shuffleArray(letters));
    setDropZones(new Array(letters.length).fill(""));
  };

  const nextQuestion = (updatedScore) => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      navigation.navigate("Score", { correct: updatedScore, total: questions.length, hintsUsed: hintsUsed });
    }
  };

  // The puzzle letters default to system font. If hintActive is true, use OpenDyslexic.
  const puzzleLetterFont = hintActive ? { fontFamily: 'OpenDyslexic' } : null;

  return (
    <ScrollView contentContainerStyle={styles.containerNoScroll}>
      <CustomHeader navigation={navigation} showBack={true} />

      <Image source={currentQuestion.image} style={styles.image} />

      <View style={styles.playAgainHintRow}>
        <TouchableOpacity 
          style={[styles.button, styles.playAgainButton]} 
          onPress={playAudio}
        >
          <Text style={[
            styles.buttonText, 
            useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 20 * dyslexicScale }
          ]}>
            {audioPlaying ? "Playing..." : "Play Again"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hintButton}
          onPress={handleHint}
        >
          <Text style={[
            styles.hintButtonText,
            useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 20 * dyslexicScale }
          ]}>
            {hintButtonLabel}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[
        styles.instruction, 
        useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 18 * dyslexicScale }
      ]}>
        Tap a letter to automatically place it in the next available box.
        Tap a filled box to remove its letter.
      </Text>

      <View style={styles.dropZoneContainer}>
        {dropZones.map((letter, index) => (
          <TouchableOpacity
            key={`dropzone-${index}`}
            style={styles.dropZone}
            onPress={() => handleDropZoneTap(index)}
          >
            <Text style={[styles.dropZoneText, puzzleLetterFont]}>
              {letter ? letter.toUpperCase() : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.draggableContainer}>
        {availableLetters.map((letter, index) => (
          <TouchableOpacity key={`tile-${index}`} style={styles.draggable} onPress={() => handleTileTap(letter)}>
            <Image source={letterImageMapping[letter]} style={styles.tileImage} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.button, { width: "90%", paddingVertical: 20 }]} 
        onPress={handleSubmit}
      >
        <Text style={[
          styles.buttonText, 
          { fontSize: 25, fontWeight: "bold" }, 
          useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 25 * dyslexicScale }
        ]}>
          Submit
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Score screen: displays the score and the total hints used.
function ScoreScreen({ route, navigation }) {
  const { useDyslexic } = useContext(FontContext);
  const { correct, total, hintsUsed } = route.params;
  const percentage = ((correct / total) * 100).toFixed(0);

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} showBack={false} />
      <Text style={[
        styles.title, 
        useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 28 * dyslexicScale }
      ]}>
        Good Try!
      </Text>
      <Text style={[
        styles.scoreText, 
        useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 22 * dyslexicScale }
      ]}>
        Correct: {correct} out of {total}
      </Text>
      <Text style={[
        styles.scoreText, 
        useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 22 * dyslexicScale }
      ]}>
        Score: {percentage}%
      </Text>
      <Text style={[
        styles.scoreText, 
        useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 22 * dyslexicScale }
      ]}>
        {hintsUsed} {hintsUsed === 1 ? "hint used." : "hints used."}
      </Text>
      <TouchableOpacity
        style={[styles.button, { width: "90%", paddingVertical: 20, backgroundColor: "#72C99F", marginTop: 20 }]}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={[
          styles.buttonText, 
          { fontSize: 25, fontWeight: "bold" },
          useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 25 * dyslexicScale }
        ]}>
          Back to Home
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function LetterPuzzleAppWrapper({ navigation }) {
  const { useDyslexic } = useContext(FontContext);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.loadingFallbackContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={[
          styles.loadingText,
          useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 16 * dyslexicScale }
        ]}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Puzzle" component={PuzzleScreen} />
      <Stack.Screen name="Score" component={ScoreScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  containerNoScroll: {
    flexGrow: 1,
    backgroundColor: "#B3D8FF",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#B3D8FF",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  loadingFallbackContainer: {
    flex: 1,
    backgroundColor: "#B3D8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "white",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 30,
    marginBottom: 20,
  },
  backIconContainer: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerRightPlaceholder: {
    width: 38,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FDEB56",
    fontFamily: "NerkoOne_400Regular",
  },
  title: {
    fontSize: 28,
    marginVertical: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  instruction: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
  },
  scoreText: {
    fontSize: 22,
    marginVertical: 5,
  },
  button: {
    backgroundColor: "#72C99F",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 8,
    marginVertical: 10,
  },
  dropZoneContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
    flexWrap: "wrap",
  },
  dropZone: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  dropZoneText: {
    fontSize: 24,
    fontWeight: "bold", 
  },
  draggableContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  draggable: {
    width: 50,
    height: 50,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  tileImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  playAgainHintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  playAgainButton: {
    backgroundColor: "grey",
    borderRadius: 30,
    marginRight: 8,
  },
  hintButton: {
    backgroundColor: '#FFDD66',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
