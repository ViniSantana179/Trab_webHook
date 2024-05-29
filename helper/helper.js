const crypto = require("crypto");
const fs = require("fs");
const util = require("util");
const generateKeyPair = util.promisify(crypto.generateKeyPair);
const forge = require("node-forge");
const nodemailer = require("nodemailer");
module.exports = class Helper {
  static hashPassword(password) {
    const hash = crypto.createHash("sha256");
    hash.update(password);
    const hashedPassword = hash.digest("hex");
    return hashedPassword;
  }

  static authenticatePassword(password, hashedPassword) {
    const hash = crypto.createHash("sha256");
    hash.update(password);
    const hashedInputPassword = hash.digest("hex");
    return hashedInputPassword === hashedPassword;
  }

  static async generateRSAKeys() {
    try {
      // Verificar se os arquivos das chaves já existem
      const publicKeyExists = await fs.promises
        .access("public_key.pem")
        .then(() => true)
        .catch(() => false);
      const privateKeyExists = await fs.promises
        .access("private_key.pem")
        .then(() => true)
        .catch(() => false);

      // Se as chaves já existirem, não é necessário gerá-las novamente
      if (publicKeyExists && privateKeyExists) {
        return;
      }

      // Se uma ou ambas as chaves não existirem, gerar um novo par de chaves
      const { publicKey, privateKey } = await generateKeyPair("rsa", {
        modulusLength: 2048, // Tamanho da chave em bits
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });

      // Escrever as chaves nos arquivos
      await Promise.all([
        fs.promises.writeFile("public_key.pem", publicKey),
        fs.promises.writeFile("private_key.pem", privateKey),
      ]);

      console.log("Par de chaves RSA gerado com sucesso.");
    } catch (error) {
      console.error("Erro ao gerar o par de chaves RSA:", error);
    }
  }

  // Função para carregar a chave pública
  static async loadPublicKey() {
    try {
      const publicKey = await fs.promises.readFile("public_key.pem", "utf8");
      return publicKey;
    } catch (error) {
      console.log(error);
    }
  }

  // Decrypt data using private key
  static async decryptAssData(encryptedHex) {
    // Carregando minha chave privada
    const privateKeyPem = fs.readFileSync("private_key.pem", "utf8");
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKeyPem);

    // Converter a representação hexadecimal de volta para bytes
    const encryptedBytes = forge.util.hexToBytes(encryptedHex);

    // Descriptografar os bytes usando a chave privada
    const decryptedBytes = privateKeyObj.decrypt(encryptedBytes, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });

    // Converter os bytes de volta para string
    const decryptedData = Buffer.from(decryptedBytes, "binary").toString(
      "utf8"
    );

    return decryptedData;
  }

  static async sendMail(comment, recipient) {
    // Configuração do transporte de e-mail
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Servidor SMTP
      port: 465, // Porta SMTP
      secure: true, // Se a conexão é segura (SSL/TLS)
      auth: {
        user: "<seu_email@email.com>", // Usuário do e-mail
        pass: "<sua senha>", // Senha do e-mail
      },
    });

    // Definição do e-mail
    const mailOptions = {
      from: "noreply@domain.com", // Remetente
      to: recipient, // Destinatário
      subject: "Comment", // Assunto
      text: comment, // Corpo do e-mail em texto simples
      // html: "<p>HTML body</p>" // Corpo do e-mail em HTML (opcional)
    };

    try {
      // Enviar e-mail
      const info = await transporter.sendMail(mailOptions);
      console.log("E-mail enviado:", info.response);
      return true; // Retorna true se o e-mail for enviado com sucesso
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      return false; // Retorna false se ocorrer um erro ao enviar o e-mail
    }
  }
};
