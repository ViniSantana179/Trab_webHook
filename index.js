const express = require("express");
const exphbs = require("express-handlebars");
const userRouter = require("./routes/userRoute.js");
const helper = require("./helper/helper.js");
const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

// Configurando meus arquivos estaticos
app.use(express.static("public"));

// Configurando minhas views
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// Configurando minhas rotas
app.use("/comment", userRouter);

// View de coments
app.get("/", (req, res) => {
  res.render("form");
});

app.listen(3000, () => {
  helper.generateRSAKeys();
  console.log("Server Rodando na porta 3000");
});
