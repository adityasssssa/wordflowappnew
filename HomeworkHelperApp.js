// HomeworkHelperApp.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import * as Font from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import { StackActions } from '@react-navigation/native';

function OCRScreen({ navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        'OpenDyslexic': require('./assets/fonts/OpenDyslexic-Regular.otf'),
      });
      setFontsLoaded(true);
    }
    loadFont();
  }, []);

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
        setImageUri(asset.uri);
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Homework Helper</Text>
      <TouchableOpacity style={styles.button} onPress={captureAndProcess}>
        <Text style={styles.buttonText}>Capture</Text>
      </TouchableOpacity>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}
      {isProcessing ? (
        <ActivityIndicator size="large" />
      ) : (
        ocrText !== '' && (
          <View style={styles.textContainer}>
            <Text style={[styles.ocrText, fontsLoaded && { fontFamily: 'OpenDyslexic' }]}>
              {ocrText}
            </Text>
          </View>
        )
      )}
      {/* Updated Back to Home button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.dispatch(StackActions.popToTop());
        }}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function HomeworkHelperApp({ navigation }) {  
  // Accept navigation prop from the wrapper and pass it to OCRScreen
  return <OCRScreen navigation={navigation} />;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  imagePreview: {
    width: 250,
    height: 250,
    marginVertical: 10,
    borderRadius: 8,
  },
  textContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 20,
    marginVertical: 20,
    width: "100%",
  },
  ocrText: {
    fontSize: 18,
    textAlign: "left",
  },
});
