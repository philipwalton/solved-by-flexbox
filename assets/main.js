import {getCLS, getFCP, getFID, getLCP} from 'web-vitals';

const thresholds = {
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  FID: [100, 300],
  LCP: [2500, 4000],
}

function getRating(value, thresholds) {
  if (value > thresholds[1]) {
    return 'poor';
  }
  if (value > thresholds[0]) {
    return 'ni';
  }
  return 'good';
}

function sendToGoogleAnalytics({name, value, delta, id}) {
  gtag('event', name, {
    value: Math.round(name === 'CLS' ? delta * 1000 : delta),
    event_category: 'Web Vitals',
    event_label: getRating(value, thresholds[name]),
    event_id: id,
    non_interaction: true,
  });
}

getCLS(sendToGoogleAnalytics);
getFCP(sendToGoogleAnalytics);
getFID(sendToGoogleAnalytics);
getLCP(sendToGoogleAnalytics);
