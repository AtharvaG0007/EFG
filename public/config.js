// config.js
// Central configuration loader for Easy Finance Guide (EFG)
// The frontend never stores API secrets. It calls the secure Firebase Function.

(function () {
  const defaultConfig = {
    API_BASE_URL: "https://us-central1-efg-mvp-3e91a.cloudfunctions.net/askGemini"
  };

  const runtimeOverride =
    typeof window !== "undefined" && window.__EFG_CONFIG__ ? window.__EFG_CONFIG__ : {};

  window.CONFIG = {
    ...defaultConfig,
    ...runtimeOverride
  };
})();