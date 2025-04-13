const BASE_URL = 'http://localhost:5001'; // Replace with process.env if needed

export const getImageUrl = (profilePicture, type = 'user', seed = '') => {
  if (!profilePicture || profilePicture === 'null') {
    return `https://api.dicebear.com/7.x/adventurer/png?seed=${seed}`;
  }

  if (profilePicture.startsWith('http')) return profilePicture;

  const filename = profilePicture.split('/').pop();
  return `${BASE_URL}/api/images/${filename}`;
};
