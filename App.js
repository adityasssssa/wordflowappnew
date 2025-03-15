// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackActions } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Import your separate app files
import WordSpeechApp from './WordSpeechApp';       // Optimized Audio Quests (P1)
import LetterPuzzleApp from './LetterPuzzleApp';   // Optimized Word Wizards (P2)
import HomeworkHelperApp from './HomeworkHelperApp'; // Optimized Study Squad (P3)

const Stack = createStackNavigator();

// Splash Screen with a static welcome message and animated "LOGGING YOU IN" text
function SplashScreen({ navigation }) {
  const [animatedText, setAnimatedText] = useState("LOGGING YOU IN");
  
  useEffect(() => {
    const texts = ["LOGGING YOU IN", "LOGGING YOU IN.", "LOGGING YOU IN..", "LOGGING YOU IN..."];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setAnimatedText(texts[index]);
    }, 500); // update every 500ms

    const timer = setTimeout(() => {
      clearInterval(interval);
      navigation.replace("Home");
    }, 3000); // 3-second delay

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.splashContainer}>
      <Text style={styles.welcomeText}>
        Welcome to WordFlow!{"\n"}Your Journey Awaits!
      </Text>
      <Text style={styles.animatedSplashText}>{animatedText}</Text>
    </View>
  );
}

// Main Menu with updated button labels and a temporary debug button
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Menu</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AudioQuests')}
      >
        <Text style={styles.buttonText}>Audio Quests</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('WordWizards')}
      >
        <Text style={styles.buttonText}>Word Wizards</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('StudySquad')}
      >
        <Text style={styles.buttonText}>Study Squad</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => { /* No function for Alphabet Arcade */ }}
      >
        <Text style={styles.buttonText}>Alphabet Arcade</Text>
      </TouchableOpacity>
      {/* Temporary debug button to show the startup splash */}
      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => navigation.navigate('Splash')}
      >
        <Text style={styles.debugButtonText}>Show Startup (Debug)</Text>
      </TouchableOpacity>
    </View>
  );
}

// Loading Wrapper for modules using an animated "LOADING" text
function createLoadingWrapper(AppComponent) {
  return function Wrapper({ navigation }) {
    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("LOADING");

    useEffect(() => {
      const texts = ["LOADING", "LOADING.", "LOADING..", "LOADING..."];
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % texts.length;
        setLoadingText(texts[index]);
      }, 500); // update every 500ms

      const timer = setTimeout(() => {
        clearInterval(interval);
        setIsLoading(false);
      }, 1000); // total wait of 3 seconds

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }, []);

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      );
    }
    return <AppComponent navigation={navigation} />;
  };
}

const WordSpeechWrapper = createLoadingWrapper(WordSpeechApp);
const LetterPuzzleWrapper = createLoadingWrapper(LetterPuzzleApp);
const HomeworkHelperWrapper = createLoadingWrapper(HomeworkHelperApp);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AudioQuests" component={WordSpeechWrapper} />
        <Stack.Screen name="WordWizards" component={LetterPuzzleWrapper} />
        <Stack.Screen name="StudySquad" component={HomeworkHelperWrapper} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B3D8FF', // new background color
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  animatedSplashText: {
    fontSize: 14,  // Smaller font for animated text
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B3D8FF', // new background color
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 40,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#72C99F', // new button color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  debugButton: {
    marginTop: 20,
    backgroundColor: '#72C99F',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B3D8FF', // new background color
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
