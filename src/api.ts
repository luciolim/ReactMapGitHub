//Valiables keep the key with map box access
const ACCESS_TOKEN_MAP_BOX = 
"access_token=pk.eyJ1IjoibHVjaW9saW0iLCJhIjoiY2tuZ28xaDFtMDJ6bzJvcDEyNGZpejY2eSJ9.K2hggqxQsOslPK8jQ08OaQ";

//Method for get an API to Mapbox and give an access key
export const fetchLocalMapBox = (local: string) =>
fetch(
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${local}.json?${ACCESS_TOKEN_MAP_BOX}`
).then(response => response.json()).then(data => data);

