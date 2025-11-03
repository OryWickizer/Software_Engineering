import app from "./app.js";
import { connectDatabase, PORT } from "./config/env.js";
import{ seedData } from "./seed.js";
await connectDatabase();
await seedData();

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
