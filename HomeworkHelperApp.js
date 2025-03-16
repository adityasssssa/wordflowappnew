// HomeworkHelperApp.js
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StackActions } from '@react-navigation/native';
import * as Font from 'expo-font';

export default function HomeworkHelperApp({ navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          'OpenDyslexic': require('./assets/fonts/OpenDyslexic-Regular.otf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn("Font load error", e);
      }
    })();
  }, []);

  // Simulate a loading screen for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const HeaderBar = () => (
    <View style={styles.headerBar}>
      <TouchableOpacity onPress={() => navigation.dispatch(StackActions.popToTop())}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Dyslexia Pal</Text>
      <View style={{ width: 60 }} />
    </View>
  );

  const StudySquadBar = () => (
    <View style={styles.studyBar}>
      <Text style={styles.studyBarText}>Study Squad</Text>
    </View>
  );

  const captureAndProcess = async () => {
    setIsProcessing(true);
    try {
      let result = await ImagePicker.launchCameraAsync({
        base64: false,
        quality: 0.5,
      });
      if (!result.canceled) {
        const asset = result.assets && result.assets[0];
        if (!asset || !asset.uri) {
          Alert.alert("Error", "No valid image captured.");
          return;
        }
        let formData = new FormData();
        formData.append("apikey", "K85325449388957");
        formData.append("language", "eng");
        formData.append("image", {
          uri: asset.uri,
          name: "photo.jpg",
          type: "image/jpeg",
        });

        const response = await fetch("https://api.ocr.space/parse/image", {
          method: "POST",
          body: formData,
        });
        const responseText = await response.text();
        let json;
        try {
          json = JSON.parse(responseText);
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          json = { error: responseText };
        }
        let recognizedText = "";
        if (json && json.ParsedResults && json.ParsedResults.length > 0) {
          recognizedText = json.ParsedResults[0].ParsedText;
        }
        if (!recognizedText || recognizedText.trim() === "") {
          recognizedText = "No text recognized. Please try again with a clearer image.";
        }
        setOcrText(recognizedText);
      }
    } catch (error) {
      console.error("Error during OCR:", error);
      Alert.alert("OCR Error", "There was an error processing the image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar />
      <StudySquadBar />
      <View style={styles.mainContent}>
        <Text style={styles.helpText}>Need help reading your homework? Click below!</Text>
        <TouchableOpacity style={styles.scannerButton} onPress={captureAndProcess}>
          <Text style={styles.scannerButtonText}>Open homework scanner</Text>
        </TouchableOpacity>
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
        {ocrText !== "" && (
          <View style={styles.resultContainer}>
            <Text style={[styles.resultText, fontsLoaded && { fontFamily: 'OpenDyslexic' }]}>
              {ocrText}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: "#B3D8FF",
    padding: 20,
    paddingTop: 60,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5C4FF",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#72C99F",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FDEB56",
  },
  studyBar: {
    backgroundColor: "#E5C4FF",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 10,
  },
  studyBarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FDEB56",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    justifyContent: "center",
  },
  helpText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 15,
    textAlign: "center",
  },
  scannerButton: {
    backgroundColor: "#72C99F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginBottom: 15,
  },
  scannerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  processingText: {
    fontSize: 14,
    marginLeft: 8,
  },
  resultContainer: {
    marginTop: 15,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    width: "90%",
    alignSelf: "center",
  },
  resultText: {
    fontSize: 14,
    color: "#000",
  },
});
