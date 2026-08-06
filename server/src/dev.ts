import app from "../api/index.js";

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Local dev server running on http://localhost:${port}`);
});
