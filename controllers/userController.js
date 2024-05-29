const Helper = require("../helper/helper.js");

module.exports = class UserController {
  static async loadPublicKey(req, res) {
    const publicKey = await Helper.loadPublicKey();
    if (publicKey) res.status(200).send(publicKey);
    else res.status(500).send("Erro ao carregar chave publica");
  }

  static async userRegisterComment(req, res) {
    console.log(req.body);

    const email = await Helper.decryptAssData(req.body.author);
    const comment = await Helper.decryptAssData(req.body.content);

    const send = Helper.sendMail(comment, email);
    if (send) res.status(200);
    else res.status(500);
  }
};
