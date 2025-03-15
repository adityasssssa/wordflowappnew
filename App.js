// App.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image 
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './HomeScreen';
import WordSpeechApp from './WordSpeechApp';
import LetterPuzzleApp from './LetterPuzzleApp';
import HomeworkHelperApp from './HomeworkHelperApp';

// Import Nerko One font
import { useFonts, NerkoOne_400Regular } from '@expo-google-fonts/nerko-one';

const Stack = createStackNavigator();
const SPLASH_DURATION_MS = 3000;

export default function App() {
  // Load NerkoOne font
  let [fontsLoaded] = useFonts({
    NerkoOne_400Regular,
  });

  const [animatedText, setAnimatedText] = useState("LOGGING YOU IN");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const texts = [
      "LOGGING YOU IN",
      "LOGGING YOU IN.",
      "LOGGING YOU IN..",
      "LOGGING YOU IN..."
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setAnimatedText(texts[index]);
    }, 500);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setShowSplash(false);
    }, SPLASH_DURATION_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  // Wait for fonts to load (if not loaded yet, show nothing or an ActivityIndicator)
  if (!fontsLoaded) {
    return null;
  }

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        {/* Wordflow logo using Nerko One */}
        <Text style={styles.splashTitle}>Wordflow</Text>
        {/* Subtitle */}
        <Text style={styles.splashSubtitle}>Dyslexia is your superpower</Text>
        {/* Larger flowers image */}
        <Image
          source={require('./assets/logos/flowers.png')}
          style={styles.splashFlowers}
          resizeMode="contain"
        />
        {/* Animated text */}
        <Text style={styles.splashAnimated}>{animatedText}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="WordSpeech" component={WordSpeechApp} />
        <Stack.Screen name="LetterPuzzle" component={LetterPuzzleApp} />
        <Stack.Screen name="HomeworkHelper" component={HomeworkHelperApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#B3D8FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  splashTitle: {
    fontFamily: 'NerkoOne_400Regular',
    fontSize: 64, // bigger logo
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    textShadowColor: "#3399FF",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  splashSubtitle: {
    fontSize: 20,
    color: "#000",
    marginBottom: 40,
  },
  splashFlowers: {
    width: 300,
    height: 300,
    marginBottom: 30,
  },
  splashAnimated: {
    fontSize: 16,
    color: "#72C99F",
    position: "absolute",
    bottom: 40,
  },
});
