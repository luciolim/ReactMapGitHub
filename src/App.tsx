import React, { useEffect, useState } from "react";
import { Alert, Linking, Text, View } from "react-native";
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { FontAwesome } from "@expo/vector-icons";
import { RectButton, TextInput } from "react-native-gesture-handler";
import * as Location from "expo-location";
import styles from "./styles";
import { fetchUserGithub, fetchLocalMapBox } from "./api";

interface Dev {
  id: number;
  avatar_url: string;
  name: string;
  bio: string;
  login: string;
  location: string;
  latitude?: number;
  longitude?: number;
  html_url: string;
}

const initialRegion = {
  latitude: 49.2576508,
  longitude: -123.2639868,
  latitudeDelta: 100,
  longitudeDelta: 100,
};

export default function App() {
  const [devs, setDevs] = useState<Dev[]>([]);
  const [username, setUsername] = useState("");
  const [region, setRegion] = useState<Region>();

  const getCurrentPosition = async () => {
    let { status } = await Location.requestPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Ops!", "Location access permission denied");
    }

    let {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync();

    setRegion({ latitude, longitude, latitudeDelta: 100, longitudeDelta: 100 });
  };

 //Objetc initionRegion centralized the map when the aplication is started. The app try to access am user location

  useEffect(() => {
    getCurrentPosition();
  }, []);

  function handleOpenGithub(url: string) {
    Linking.openURL(url);
  }

  //Function search a github user from user name typed on app
  async function handleSearchUser() {
    let dev: Dev;

    if (!username) return;

    //Create a variable for safe the return on JSON from Github api
    const githubUser = await fetchUserGithub(username);

    //Check if user and location exist. Return user if both is true or error message if is false
    if (!githubUser || !githubUser.location) {
      Alert.alert(
        "Ops!",
        "User not found or does not have the location defined on Github"
      );
      return;
    }
     //Create variable get a return from mapbox api and set a user location searched and show on map. 
    const localMapBox = await fetchLocalMapBox(githubUser.location);

    //Error message when location is incorrect
    if (!localMapBox || !localMapBox.features[0].center) {
      Alert.alert(
        "Ops!",
        "Error converting the user's location to geographic coordinates!"
      );
      return;
    }

    //Create 2 variables get latitude and longitude from Mapbox
    const [longitude, latitude] = localMapBox.features[0].center;

    dev = {
      ...githubUser,
      latitude,
      longitude,
    };

    setRegion({
      latitude,
      longitude,
      latitudeDelta: 3,
      longitudeDelta: 3,
    });
