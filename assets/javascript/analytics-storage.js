const GA_LOCAL_STORAGE_KEY = '_ga';


// Schema:
// ---------------------
// {
//   clientId: String(),
//   trackers: {
//     [name]: {
//       index: Number,
//       time: Number,
//       payload: String
//     }
//   }
// }


export function getStoredData() {
  let data;
  try {
    data = JSON.parse(window.localStorage.getItem(GA_LOCAL_STORAGE_KEY));
  } catch (err) {
    // Do nothing...
  }
  data = data || {};
  data.trackers = data.trackers || {};
  return data;
}


export function getStoredTrackerData(name) {
  let data = getStoredData();
  return data.trackers[name] || {};
}


export function setStoredData(data) {
  try {
    window.localStorage.setItem(GA_LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch(err) {
    // Do nothing...
  }
}


export function setStoredTrackerData(name, trackerData) {
  let data = getStoredData();
  data.trackers[name] = trackerData;
  setStoredData(data);
}
