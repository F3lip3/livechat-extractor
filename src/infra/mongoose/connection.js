import mongoose from 'mongoose';

const config = {
  host: 'localhost',
  port: 27017,
  database: 'livechat-extractor'
};

mongoose.connect(`mongodb://${config.host}:${config.port}/${config.database}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
