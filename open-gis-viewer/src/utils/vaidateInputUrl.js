export const isNotEmpty = (url) => {
  return url.trim() !== "";
};
export const validateXYZUrl = (url) => {
  return /^https?:\/\/.*\{x}.*\{y}.*\{z}/.test(url.trim());
};

export const validateWMSUrl = (url) => {
  return /^https:\/\/.*\?SERVICE=WMS&VERSION=1.3.0$|&SERVICE=WMS&VERSION=1.3.0$/.test(
    url.trim()
  );
};
