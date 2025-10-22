import app from "./app.js";
import { connectDatabase, PORT } from "./config/env.js";

connectDatabase();

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
