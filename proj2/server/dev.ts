import { createServer } from "./index";

const app = createServer();
const port = Number(process.env.PORT || 3001);

app.listen(port, () => {
  console.log(`EcoBites API running on http://localhost:${port}`);
});
