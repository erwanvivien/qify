// log the pageview with their URL
const NEXT_PUBLIC_GOOGLE_ANALYTICS = "G-RS7KW9G4C5";

export const pageview = (url) => {
  window.gtag("config", NEXT_PUBLIC_GOOGLE_ANALYTICS, {
    page_path: url,
  });
};

// log specific events happening.
export const event = ({ action, params }) => {
  window.gtag("event", action, params);
};
