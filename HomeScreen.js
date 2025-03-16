// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  Alert,
  SafeAreaView,
  ActivityIndicator 
} from 'react-native';
import { useFonts, NerkoOne_400Regular } from '@expo-google-fonts/nerko-one';
import AppLoading from 'expo-app-loading';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_GOAL = "I want to learn 3 new skills and get to level 4 of word blocks!!!!!";
const QUOTES = [
  "Do what you have to do until you can do what you want to do. – Oprah Winfrey",
  "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful. – Albert Schweitzer",
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Don’t watch the clock; do what it does. Keep going. – Sam Levenson",
  "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. – Steve Jobs",
  "Opportunities don't happen. You create them. – Chris Grosser",
  "Believe you can and you're halfway there. – Theodore Roosevelt",
  "Work hard in silence, let success make the noise. – Frank Ocean",
  "Success usually comes to those who are too busy to be looking for it. – Henry David Thoreau",
  "Act as if what you do makes a difference. It does. – William James",
];

export default function HomeScreen({ navigation }) {
  const [goal, setGoal] = useState("");
  const [quote, setQuote] = useState("");

  const [fontsLoaded] = useFonts({
    NerkoOne_400Regular,
  });

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const storedGoal = await AsyncStorage.getItem('userGoal');
        if (storedGoal !== null) {
          setGoal(storedGoal);
        } else {
          setGoal(DEFAULT_GOAL);
          await AsyncStorage.setItem('userGoal', DEFAULT_GOAL);
        }
      } catch (error) {
        console.error("Error loading goal", error);
      }
    };
    loadGoal();

    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
  }, []);

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#72C99F" />
      </SafeAreaView>
    );
  }

  const handleChangeGoal = () => {
    if (Alert.prompt) {
      Alert.prompt(
        "Update Your Goal",
        "Type your new goal below:",
        (text) => {
          if (text && text.trim() !== "") {
            setGoal(text.trim());
            AsyncStorage.setItem('userGoal', text.trim());
          }
        }
      );
    } else {
      Alert.alert("Goal Editing", "Goal editing is not supported on this platform yet.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dyslexia Pal</Text>

      <View style={styles.goalBox}>
        <View style={styles.goalBoxTopRow}>
          <Text style={styles.goalBoxTitle}>My goal is</Text>
          <Image
            source={require('./assets/logos/target.png')}
            style={styles.targetIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.goalText}>{goal}</Text>
        <TouchableOpacity onPress={handleChangeGoal}>
          <Text style={styles.changeLink}>Change</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.appRow}>
        <TouchableOpacity 
          style={[styles.appBox, { backgroundColor: "#FFE3EF" }]} 
          onPress={() => navigation.navigate("WordSpeech")}
        >
          <Image
            source={require('./assets/logos/mic.png')}
            style={styles.appIcon}
            resizeMode="contain"
          />
          <Text style={styles.appLabel}>Audio quests</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.appBox, { backgroundColor: "#D7EEFF" }]}
          onPress={() => console.log("word wizards pressed")}
        >
          <Image
            source={require('./assets/logos/crayon.png')}
            style={styles.appIcon}
            resizeMode="contain"
          />
          <Text style={styles.appLabel}>Word wizards</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.appRow}>
        <TouchableOpacity 
          style={[styles.appBox, { backgroundColor: "#FFEECC" }]}
          onPress={() => navigation.navigate("HomeworkHelper")}
        >
          <Image
            source={require('./assets/logos/write.png')}
            style={styles.appIcon}
            resizeMode="contain"
          />
          <Text style={styles.appLabel}>Study squad</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.appBox, { backgroundColor: "#D5F4E5" }]}
          onPress={() => {
            // console.warn("Alphabet Arcade button pressed, but no action is defined.");
            navigation.push("LetterPuzzle")
          }}
        >
          <Image
            source={require('./assets/logos/blocks.png')}
            style={styles.appIcon}
            resizeMode="contain"
          />
          <Text style={styles.appLabel}>Alphabet arcade</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.empowerText}>Empower yourself!</Text>
      <Text style={styles.quoteText}>{quote}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B3D8FF",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontFamily: "NerkoOne_400Regular",
    fontSize: 50,
    color: "#FDEB56",
    marginTop: 10,
    marginBottom: 15,
  },
  goalBox: {
    width: "90%",
    backgroundColor: "#FFF19D",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  goalBoxTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalBoxTitle: {
    fontSize: 24,
    color: "#000",
    fontWeight: "bold",
  },
  targetIcon: {
    width: 100,
    height: 100,
  },
  goalText: {
    fontSize: 16,
    color: "#000",
    marginVertical: 10,
  },
  changeLink: {
    fontSize: 14,
    color: "#3333FF",
    textDecorationLine: "underline",
    alignSelf: "flex-end",
  },
  appRow: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  appBox: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  appIcon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  appLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  empowerText: {
    fontFamily: "NerkoOne_400Regular",
    fontSize: 33,
    color: "#FDEB56",
    marginTop: 10,
  },
  quoteText: {
    fontSize: 16,
    color: "#000",
    marginTop: 5,
    textAlign: "center",
    width: "90%",
  },
});
