// LetterPuzzleApp.js
import React, { useState, useEffect } from 'react';
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

const shuffleArray = (array) => {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// CustomHeader now accepts a "showBack" prop.
// When true, it displays the back button; when false, it does not.
const CustomHeader = ({ navigation, showBack = true }) => (
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
      <Text style={styles.headerTitle}>Dyslexia Pal</Text>
    </View>
    {/* Placeholder to balance the layout when back button is shown */}
    {showBack && <View style={styles.headerRightPlaceholder} />}
  </View>
);

function PuzzleScreen({ navigation }) {
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
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });
  }, []);

  useEffect(() => {
    playAudio();
    resetPuzzle();
    setFirstAttemptCorrect(null);
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
        Alert.alert("Correct", "Your answer is now correct, but your first attempt was marked incorrect.", [
          { text: "OK", onPress: () => nextQuestion(firstAttemptScore) }
        ]);
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
      navigation.navigate("Score", { correct: updatedScore, total: questions.length });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.containerNoScroll}>
      <CustomHeader navigation={navigation} showBack={true} />
      <Image source={currentQuestion.image} style={styles.image} />
      <TouchableOpacity style={[styles.button, { backgroundColor: "grey", borderRadius: 30 }]} onPress={playAudio}>
        <Text style={styles.buttonText}>{audioPlaying ? "Playing..." : "Play Again"}</Text>
      </TouchableOpacity>
      <Text style={styles.instruction}>
        Tap a letter to automatically place it in the next available box.
        Tap a filled box to remove its letter.
      </Text>
      <View style={styles.dropZoneContainer}>
        {dropZones.map((letter, index) => (
          <TouchableOpacity key={`dropzone-${index}`} style={styles.dropZone} onPress={() => handleDropZoneTap(index)}>
            <Text style={styles.dropZoneText}>{letter ? letter.toUpperCase() : ""}</Text>
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
      <TouchableOpacity style={[styles.button, { width: "90%", paddingVertical: 20 }]} onPress={handleSubmit}>
        <Text style={[styles.buttonText, { fontSize: 25, fontWeight: "bold" }]}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={resetPuzzle}>
        <Text style={[styles.buttonText, { color: "blue", textDecorationLine: "underline" }]}>Reset</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ScoreScreen({ route, navigation }) {
  const { correct, total } = route.params;
  const percentage = ((correct / total) * 100).toFixed(0);
  return (
    <View style={styles.container}>
      {/* Do not show back button on end screen */}
      <CustomHeader navigation={navigation} showBack={false} />
      <Text style={styles.title}>Test Complete</Text>
      <Text style={styles.scoreText}>Correct: {correct} out of {total}</Text>
      <Text style={styles.scoreText}>Score: {percentage}%</Text>
      <TouchableOpacity
        style={[styles.button, { width: "90%", paddingVertical: 20, backgroundColor: "#FF6347", marginTop: 20 }]}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={[styles.buttonText, { fontSize: 25, fontWeight: "bold" }]}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

// Loading wrapper for LetterPuzzleApp: wait 3 seconds before showing Navigator.
export default function LetterPuzzleAppWrapper({ navigation }) {
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
        <Text style={styles.loadingText}>Loading...</Text>
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
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#B3D8FF",
  },
  containerNoScroll: {
    flexGrow: 1,
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
    fontSize: 40, // Updated font size to 40
    fontWeight: "bold",
    color: "#FDEB56", // Yellow color
    fontFamily: "NerkoOne_400Regular",
  },
  container: {
    flex: 1,
    backgroundColor: "#B3D8FF",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
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
  },
  dropZone: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 5,
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
});

export { LetterPuzzleAppWrapper as LetterPuzzleApp };
