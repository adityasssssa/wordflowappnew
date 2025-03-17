// WordSpeechApp.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as Font from 'expo-font';
import { Audio } from 'expo-av';
import { useFonts, NerkoOne_400Regular } from '@expo-google-fonts/nerko-one';
import { FontContext } from './App';

const REV_AI_ACCESS_TOKEN = "02Zmaws-lBJjwJTmw8_k5LxfNL-coIIgiDKstyFkuD7giZmCb8Wv2Tg0A6ahovKj7zJjy8bLRnExL-4yeHSjSCVuaYq8o";

const sentencesByDifficulty = {
  easy: [
    "The sun is hot.",
    "She has a red hat."
  ],
  medium: [
    "The brown horse jumps over the fence.",
    "We went to the beach and played in the sand."
  ],
  hard: [
    "The architect designed a magnificent skyscraper with intricate details.",
    "Scientists discovered a revolutionary breakthrough in quantum mechanics."
  ]
};

const difficulties = ["easy", "medium", "hard"];
const difficultyColors = {
  easy: "green",
  medium: "orange",
  hard: "red"
};

export default function WordSpeechApp({ navigation }) {
  const { useDyslexic } = useContext(FontContext);

  // Local Hint Toggle (for sentence text only) and counter logic
  const [hintActive, setHintActive] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  // Tracks if a hint has been used for the current question (only one count per question)
  const [hintUsedForCurrentQuestion, setHintUsedForCurrentQuestion] = useState(false);

  const hintLabel = hintActive ? "Hint Shown" : "Hint";
  const toggleHint = () => {
    // If hint not used yet for this question, count it and mark it as used.
    if (!hintUsedForCurrentQuestion) {
      setHintsUsed(prev => prev + 1);
      setHintUsedForCurrentQuestion(true);
    }
    setHintActive(!hintActive);
  };

  // Reset hint-used flag whenever the question changes.
  useEffect(() => {
    setHintUsedForCurrentQuestion(false);
  }, [currentSentence]);

  // Scaling factor for dyslexic mode text sizes
  const dyslexicScale = 0.76;

  // Load both fonts: NerkoOne and OpenDyslexic
  let [fontsLoaded] = useFonts({
    'OpenDyslexic': require('./assets/fonts/OpenDyslexic-Regular.otf'),
    NerkoOne_400Regular,
  });

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const [currentScreen, setCurrentScreen] = useState("record");
  const [currentDifficultyIndex, setCurrentDifficultyIndex] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [fullAttemptCorrect, setFullAttemptCorrect] = useState(true);
  const [currentSentence, setCurrentSentence] = useState("");
  const [repeatWords, setRepeatWords] = useState(null);
  const [currentAttemptCount, setCurrentAttemptCount] = useState(1);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [totalRetries, setTotalRetries] = useState(0);
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  useEffect(() => {
    startAdaptiveMode();
  }, []);

  const startAdaptiveMode = () => {
    setCurrentDifficultyIndex(0);
    setCurrentSentenceIndex(0);
    setFullAttemptCorrect(true);
    setCurrentAttemptCount(1);
    setFirstTryCount(0);
    setTotalRetries(0);
    const diff = difficulties[0];
    setCurrentSentence(sentencesByDifficulty[diff][0]);
    setCurrentScreen("record");
    setHintActive(false);
  };

  // Header Bar with Back button, title ("Audio Quests"), and difficulty indicator
  const HeaderBar = () => {
    const difficulty = difficulties[currentDifficultyIndex];
    return (
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => {
            if(navigation && navigation.navigate) {
              navigation.goBack();
            }
          }}
        >
          <Text style={[
            styles.backText, 
            useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 22 * dyslexicScale }
          ]}>
            Back
          </Text>
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle, 
          useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 25 * dyslexicScale }
        ]}>
          Audio Quests
        </Text>
        <Text style={[
          styles.difficultyText, 
          { color: difficultyColors[difficulty] },
          useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 18 * dyslexicScale }
        ]}>
          {difficulty.toUpperCase()}
        </Text>
      </View>
    );
  };

  // Logo Text: ALWAYS uses NerkoOne, regardless of the toggle.
  const LogoText = () => (
    <Text style={styles.logoText}>
      Dyslexia Pal
    </Text>
  );

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]|_/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const onMicPressIn = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission Denied", "Microphone permission is required!");
        return;
      }
      const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Recording Error", "Failed to start recording.");
    }
  };

  const onMicPressOut = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setIsRecording(false);
      uploadRecording(uri);
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Recording Error", "Failed to stop recording.");
    }
  };

  const uploadRecording = async (uri) => {
    setIsUploading(true);
    let formData = new FormData();
    formData.append("media", {
      uri: uri,
      name: "recording.wav",
      type: "audio/wav",
    });
    try {
      const response = await fetch("https://api.rev.ai/speechtotext/v1/jobs", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${REV_AI_ACCESS_TOKEN}`,
        },
        body: formData,
      });
      const data = await response.json();
      const jobId = data.id || data.job_id;
      if (jobId) {
        pollJob(jobId);
      } else {
        Alert.alert("Upload Error", "Failed to create transcription job.");
      }
    } catch (error) {
      console.error("Error uploading recording:", error);
      Alert.alert("Upload Error", "There was an error uploading the recording.");
    } finally {
      setIsUploading(false);
    }
  };

  const pollJob = async (jobId) => {
    setIsPolling(true);
    try {
      let jobStatus = "";
      while (jobStatus !== "transcribed" && jobStatus !== "failed") {
        const res = await fetch(`https://api.rev.ai/speechtotext/v1/jobs/${jobId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${REV_AI_ACCESS_TOKEN}`,
          },
        });
        const jobData = await res.json();
        jobStatus = jobData.status;
        if (jobStatus === "transcribed") {
          const transcriptRes = await fetch(`https://api.rev.ai/speechtotext/v1/jobs/${jobId}/transcript`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${REV_AI_ACCESS_TOKEN}`,
              "Accept": "text/plain",
            },
          });
          const transcriptText = await transcriptRes.text();
          setTranscript(transcriptText);
          processTranscript(transcriptText);
          break;
        } else if (jobStatus === "failed") {
          Alert.alert("Job Failed", "Transcription job failed. Please try again.");
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error("Error polling job:", error);
      Alert.alert("Polling Error", "Error retrieving transcription status.");
    } finally {
      setIsPolling(false);
    }
  };

  const processTranscript = (transcriptText) => {
    const normalizedTranscript = normalizeText(transcriptText);
    const normalizedTarget = normalizeText(currentSentence);
    
    if (currentScreen === "record") {
      if (normalizedTranscript.includes(normalizedTarget)) {
        setFullAttemptCorrect(true);
        Alert.alert("Good job", "You said the sentence correctly!");
        handleSentenceCompleted();
      } else {
        setFullAttemptCorrect(false);
        const targetWords = normalizedTarget.split(" ");
        const statuses = targetWords.map(word => normalizedTranscript.includes(word));
        const wrongWords = targetWords
          .filter((word, i) => !statuses[i])
          .map(word => ({ word, correct: false }));
        if (wrongWords.length > 0) {
          setRepeatWords(wrongWords);
          setCurrentScreen("repeat");
          Alert.alert("Try Again", "Pronounce the words you got wrong: " + wrongWords.map(obj => obj.word).join(", "));
        }
      }
    } else if (currentScreen === "repeat") {
      setCurrentAttemptCount(prev => prev + 1);
      setTotalRetries(prev => prev + 1);
      const updatedRepeat = repeatWords.map(obj => ({
        word: obj.word,
        correct: obj.correct || normalizedTranscript.includes(obj.word)
      }));
      setRepeatWords(updatedRepeat);
      if (updatedRepeat.every(obj => obj.correct)) {
        Alert.alert("Good job", "You pronounced the words correctly!");
        handleSentenceCompleted();
      } else {
        const stillWrong = updatedRepeat.filter(obj => !obj.correct).map(obj => obj.word);
        Alert.alert("Try Again", "Still incorrect: " + stillWrong.join(", "));
      }
    }
  };

  const handleSentenceCompleted = () => {
    const currentDiff = difficulties[currentDifficultyIndex];
    if (currentAttemptCount === 1) {
      setFirstTryCount(prev => prev + 1);
    }
    setCurrentAttemptCount(1);
    if (fullAttemptCorrect) {
      moveToNextDifficulty();
    } else {
      const nextSentenceIndex = currentSentenceIndex + 1;
      if (nextSentenceIndex < sentencesByDifficulty[currentDiff].length) {
        setCurrentSentenceIndex(nextSentenceIndex);
        setCurrentSentence(sentencesByDifficulty[currentDiff][nextSentenceIndex]);
        setFullAttemptCorrect(true);
        setRepeatWords(null);
        setCurrentScreen("record");
      } else {
        moveToNextDifficulty();
      }
    }
  };

  const moveToNextDifficulty = () => {
    // Reset hint-used flag for new question
    setHintUsedForCurrentQuestion(false);
    const nextDiffIndex = currentDifficultyIndex + 1;
    if (nextDiffIndex < difficulties.length) {
      setCurrentDifficultyIndex(nextDiffIndex);
      const nextDiff = difficulties[nextDiffIndex];
      setCurrentSentenceIndex(0);
      setCurrentSentence(sentencesByDifficulty[nextDiff][0]);
      setFullAttemptCorrect(true);
      setRepeatWords(null);
      setCurrentScreen("record");
    } else {
      setCurrentScreen("finalEnd");
    }
  };

  const resetAll = () => {
    setCurrentDifficultyIndex(0);
    setCurrentSentenceIndex(0);
    setFullAttemptCorrect(true);
    setCurrentSentence("");
    setRepeatWords(null);
    setCurrentAttemptCount(1);
    setFirstTryCount(0);
    setTotalRetries(0);
    setRecording(null);
    setRecordingUri(null);
    setTranscript("");
    setHintActive(false);
    if (navigation && navigation.navigate) {
      navigation.navigate("Home");
    }
  };

  if (!isLoaded || !fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
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

  // Use OpenDyslexic font for sentence text when hint is active; otherwise default.
  const sentenceFont = hintActive ? { fontFamily: 'OpenDyslexic' } : null;

  const renderContent = () => {
    if (currentScreen === "finalEnd") {
      return (
        <SafeAreaView style={styles.mainContainer}>
          <View style={styles.topSection}>
            <LogoText />
            <HeaderBar />
          </View>
          <View style={styles.middleSection}>
            <Text style={[
              styles.finalEndTitle,
              useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 28 * dyslexicScale }
            ]}>
              All Done!
            </Text>
            <Text style={[
              styles.endScoreText,
              useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 20 * dyslexicScale }
            ]}>
              You got {firstTryCount} sentence{firstTryCount !== 1 ? "s" : ""} correct on the first try{"\n"}
              and took {totalRetries} {totalRetries === 1 ? "Retry" : "Retries"} in total.
            </Text>
            <Text style={[
              styles.hintScoreText,
              useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 20 * dyslexicScale }
            ]}>
              {hintsUsed} {hintsUsed === 1 ? "hint used." : "hints used."}
            </Text>
          </View>
          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.recordButton} onPress={resetAll}>
              <Text style={[
                styles.recordButtonText,
                useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 25 * dyslexicScale }
              ]}>
                Home
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    } else if (currentScreen === "repeat") {
      return (
        <SafeAreaView style={styles.mainContainer}>
          <View style={styles.topSection}>
            <LogoText />
            <HeaderBar />
          </View>
          <View style={styles.middleSection}>
            <Text style={[
              styles.readSentenceText,
              useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 30 * dyslexicScale }
            ]}>
              Repeat the missed words:
            </Text>
            <View style={styles.sentenceContainer}>
              {repeatWords.map((obj, index) => (
                <Text
                  key={index}
                  style={[
                    styles.word,
                    hintActive && { fontFamily: 'OpenDyslexic' },
                    obj.correct ? styles.correctWord : styles.incorrectWord,
                    useDyslexic && { fontSize: 36 * dyslexicScale }
                  ]}
                >
                  {obj.word}
                </Text>
              ))}
            </View>
          </View>
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.recordButton}
              onPressIn={onMicPressIn}
              onPressOut={onMicPressOut}
              disabled={isRecording}
            >
              <Text style={[
                styles.recordButtonText,
                useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 30 * dyslexicScale }
              ]}>
                Hold to Record
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.hintButton} onPress={toggleHint}>
              <Text style={[
                styles.hintButtonText,
                useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 20 * dyslexicScale }
              ]}>
                {hintLabel}
              </Text>
            </TouchableOpacity>

            {(isUploading || isPolling) && (
              <View style={styles.checkingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={[
                  styles.checkingText,
                  useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 18 * dyslexicScale }
                ]}>
                  Checking...
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      );
    } else {
      return (
        <SafeAreaView style={styles.mainContainer}>
          <View style={styles.topSection}>
            <LogoText />
            <HeaderBar />
          </View>
          <View style={styles.middleSection}>
            <Text style={[
              styles.readSentenceText,
              useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 30 * dyslexicScale }
            ]}>
              Read the sentence:
            </Text>
            <Text style={[styles.sentenceText, sentenceFont]}>
              {currentSentence}
            </Text>
          </View>
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.recordButton}
              onPressIn={onMicPressIn}
              onPressOut={onMicPressOut}
              disabled={isRecording}
            >
              <Text style={[
                styles.recordButtonText,
                useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 30 * dyslexicScale }
              ]}>
                Hold to Record
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.hintButton} onPress={toggleHint}>
              <Text style={[
                styles.hintButtonText,
                useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 20 * dyslexicScale }
              ]}>
                {hintLabel}
              </Text>
            </TouchableOpacity>

            {(isUploading || isPolling) && (
              <View style={styles.checkingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={[
                  styles.checkingText,
                  useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 18 * dyslexicScale }
                ]}>
                  Checking...
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#B3D8FF",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#B3D8FF",
  },
  topSection: {
    alignItems: "center",
    marginBottom: 10,
  },
  middleSection: {
    flex: 1,
    marginTop: 150,
    paddingHorizontal: 20,
  },
  bottomSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  loadingContainer: {
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
  logoText: {
    fontFamily: 'NerkoOne_400Regular',
    fontSize: 50,
    color: "#FDEB56",
    fontWeight: "bold",
    marginVertical: 10,
  },
  headerBar: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5C4FF",
    width: "95%",
    paddingVertical: 25,
    paddingHorizontal: 15,
    justifyContent: "space-between",
    borderRadius: 10,
  },
  backText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#72C99F",
  },
  headerTitle: {
    fontSize: 25,
    alignItems: "center",
    color: "white",
    fontWeight: "bold",
  },
  difficultyText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  readSentenceText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FDEB56",
    marginBottom: 20,
    marginTop: -60,
    textAlign: "left",
    marginLeft: 5
  },
  sentenceText: {
    fontSize: 30,
    color: "#000",
    textAlign: "left",
    marginTop: 20,
    overflow: "visible",
  },
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  word: {
    fontSize: 36,
    margin: 5,
  },
  correctWord: {
    color: "green",
  },
  incorrectWord: {
    color: "red",
  },
  recordButton: {
    backgroundColor: "#72C99F",
    paddingVertical: 30,
    marginBottom: 20,
    paddingHorizontal: 25,
    borderRadius: 13,
    width: "80%",
    alignItems: "center",
  },
  recordButtonText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  checkingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  checkingText: {
    fontSize: 18,
    marginLeft: 10,
  },
  finalEndTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FDEB56",
    textAlign: "center",
  },
  endScoreText: {
    fontSize: 20,
    textAlign: "center",
    marginHorizontal: 20,
    color: "#000",
    marginBottom: 10,
  },
  hintScoreText: {
    fontSize: 20,
    textAlign: "center",
    marginHorizontal: 20,
    color: "#000",
    marginBottom: 20,
  },
  backIconContainer: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  hintButton: {
    backgroundColor: '#FFDD66',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  hintButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});
