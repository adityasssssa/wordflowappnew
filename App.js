// App.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackActions } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import WordSpeechApp from './WordSpeechApp';
import LetterPuzzleApp from './LetterPuzzleApp';
import HomeworkHelperApp from './HomeworkHelperApp';

const Stack = createStackNavigator();

// Splash Screen with animated "LOGGING YOU IN" text and a welcome message.
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
      <Text style={styles.splashWelcome}>
        Welcome to WordFlow!{"\n"}Your Journey Awaits!
      </Text>
      <Text style={styles.splashAnimated}>{animatedText}</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  splashWelcome: {
    fontSize: 28,
    textAlign: "center",
    color: "#FDEB56",
    fontWeight: "bold",
    marginBottom: 20,
  },
  splashAnimated: {
    fontSize: 18,
    color: "#72C99F",
  },
});
