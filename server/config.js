const isDev = process.env.NODE_ENV === 'development';
const SERVER_HOST_URL = process.env.SERVER_HOST_URL;

module.exports = {
  isDev,
  cors: {
    origin: [SERVER_HOST_URL]    
  },
  db: {
    uri: process.env.MONGO_URI,
    name: 'iMax',
  },
};
