const { createUser } = require('./models/userModel');
async function test() {
  try {
    await createUser('test99@example.com', 'test', 'hash123', 'Nomad');
    console.log('Success');
  } catch (err) {
    console.error('DB ERROR:', err);
  }
}
test();
