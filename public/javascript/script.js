document
  .getElementById("commentForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const comment = document.getElementById("comment").value;

    const emailEncrypt = await dataEncrypt(email);
    const commentEncrypt = await dataEncrypt(comment);

    const payload = {
      author: emailEncrypt,
      content: commentEncrypt,
      date: new Date().toISOString(),
    };

    fetch("http://localhost:3000/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("responseMessage").innerText =
          "Comentário enviado com sucesso!";
        document.getElementById("commentForm").reset();
      })
      .catch((error) => {
        document.getElementById("responseMessage").innerText =
          "Erro ao enviar comentário.";
        console.error("Erro:", error);
      });
  });

async function dataEncrypt(data) {
  try {
    const response = await fetch("http://localhost:3000/comment/loadPk");
    if (!response.ok) {
      console.log("ERRO");
      throw new Error("Erro ao carregar chave pública");
    }
    const publicKey = await response.text();
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
    const encryptedData = publicKeyObj.encrypt(data, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });
    const encryptedHex = forge.util.bytesToHex(encryptedData);
    return encryptedHex;
  } catch (error) {
    console.error("Erro:", error);
    alert(error.message);
    return null;
  }
}
