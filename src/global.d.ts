//Used for adjust navigation typing that are on global way in React Native.
//It does not a interface, we have IDE error (VS code) and solution was declare global type

declare var navigator: {
    geolocation: {
      getCurrentPosition: (position: any, error: any ) => void
    }
  };