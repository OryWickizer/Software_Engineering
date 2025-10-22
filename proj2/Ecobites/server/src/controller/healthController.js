export const getHealth = (req, res) => {
  res.json({ status: "ok", message: "Server is running fine!" });
};

