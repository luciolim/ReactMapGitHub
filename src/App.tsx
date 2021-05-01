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

    //If search the same id on Github It return itself
    const devAlreadyExists = dev && devs.find((user) => user.id === dev.id);

    if (devAlreadyExists) return;

    setDevs([...devs, dev]);
    setUsername("");
  }

  return (

    //Create a map component with its properties and fill up whole screen
  <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        initialRegion={initialRegion}
      >
        {devs.map((dev) => (
          <Marker
            key={dev.id}
            image={{ uri: `${dev.avatar_url}&s=120` }}
            calloutAnchor={{
              x: 2.9,
              y: 0.8,
            }}
            coordinate={{
              latitude: Number(dev.latitude),
              longitude: Number(dev.longitude),
            }}
          >
{/* Create a component to view a suspended box with name and function by researched user from github*/}
            <Callout tooltip onPress={() => handleOpenGithub(dev.html_url)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutText}>{dev.name}</Text>
                <Text style={styles.calloutSmallText}>{dev.bio}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
 {/* Create a input component to take name by user for search from github*/}
      <View style={styles.footer}>
        <TextInput
          placeholder={`${devs.length} Dev's found`}
          style={styles.footerText}
          onChangeText={setUsername}
          value={username}
        />
{/* Create an icon button to call a function handleSearchUser that get a github user*/}
        <RectButton style={styles.searchUserButton} onPress={handleSearchUser}>
          <FontAwesome name="github" size={24} color="#fff" />
        </RectButton>
      </View>
    </View>
  );
}