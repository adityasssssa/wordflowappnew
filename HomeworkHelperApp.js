// HomeworkHelperApp.js
import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StackActions } from '@react-navigation/native';
import { useFonts, NerkoOne_400Regular } from '@expo-google-fonts/nerko-one';
import * as Font from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontContext } from './App';

export default function HomeworkHelperApp({ navigation }) {
  const { useDyslexic } = useContext(FontContext);
  // Constant scaling factor for dyslexic mode text sizes
  const dyslexicScale = 0.76;

  const [localFontLoaded, setLocalFontLoaded] = useState(false);
  let [fontsLoaded] = useFonts({
    NerkoOne_400Regular,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load OpenDyslexic from local assets for OCR text (always load it)
  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          'OpenDyslexic': require('./assets/fonts/OpenDyslexic-Regular.otf'),
        });
        setLocalFontLoaded(true);
      } catch (e) {
        console.warn("Font load error", e);
      }
    })();
  }, []);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      }
    })();
  }, []);

  // Simulate a loading screen for 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded || !fontsLoaded || !localFontLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text
          style={[
            styles.loadingText,
            useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 16 * dyslexicScale }
          ]}
        >
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  // Header Bar with back button and title "Dyslexia Pal" using original NerkoOne font (no toggle)
  const HeaderBar = () => (
    <View style={styles.headerBar}>
      <TouchableOpacity
        onPress={() => navigation.dispatch(StackActions.popToTop())}
        style={styles.backIconContainer}
      >
        <Ionicons name="arrow-back-circle-outline" size={32} color="#888" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        Dyslexia Pal
      </Text>
      <View style={{ width: 45 }} />
    </View>
  );

  const HomeworkReaderBar = () => (
    <View style={styles.homeworkReaderBar}>
      <Text
        style={[
          styles.homeworkReaderText,
          useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 22 * dyslexicScale }
        ]}
      >
        Homework Reader
      </Text>
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
          setIsProcessing(false);
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
        const json = await response.json();
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
      <HomeworkReaderBar />
      <ScrollView contentContainerStyle={styles.mainContent}>
        <Text
          style={[
            styles.helpText,
            useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 26 * dyslexicScale }
          ]}
        >
          Need help reading your homework? Click below!
        </Text>
        <TouchableOpacity style={styles.scannerButton} onPress={captureAndProcess}>
          <Text
            style={[
              styles.scannerButtonText,
              useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 20 * dyslexicScale }
            ]}
          >
            Open Homework Scanner
          </Text>
        </TouchableOpacity>
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text
              style={[
                styles.processingText,
                useDyslexic && { fontFamily: 'OpenDyslexic', fontSize: 16 * dyslexicScale }
              ]}
            >
              Processing...
            </Text>
          </View>
        )}
        {ocrText !== "" && (
          <View style={styles.resultContainer}>
            <Text
              style={[
                styles.scannedText,
                {
                  // For scanned text, toggle between fonts:
                  fontFamily: useDyslexic ? 'OpenDyslexic' : 'NerkoOne_400Regular',
                  fontSize: useDyslexic ? 16 * dyslexicScale : 16,
                }
              ]}
            >
              {ocrText}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* Loading screen styles */
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

  /* Main container */
  container: {
    flex: 1,
    backgroundColor: "#B3D8FF",
  },

  /* Header Bar */
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B3D8FF",
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  backIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'NerkoOne_400Regular',
    fontSize: 40,
    color: "#FDEB56",
  },

  /* Homework Reader Bar */
  homeworkReaderBar: {
    backgroundColor: "#CFD6FF",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
    borderRadius: 15,
    width: "70%",
    alignSelf: "center",
  },
  homeworkReaderText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FDEB56",
  },

  /* Main content */
  mainContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  helpText: {
    fontSize: 26,
    color: "#000",
    marginBottom: 40,
    textAlign: "center",
  },

  /* Scanner Button */
  scannerButton: {
    backgroundColor: "#72C99F",
    paddingVertical: 30,
    paddingHorizontal: 35,
    borderRadius: 15,
    marginBottom: 30,
  },
  scannerButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  /* Processing overlay */
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  processingText: {
    fontSize: 16,
    marginLeft: 8,
  },

  /* OCR result container */
  resultContainer: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    width: "100%",
  },
  scannedText: {
    color: "#000",
  },
});
