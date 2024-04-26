import * as openpgp from "openpgp/lightweight";

export const encryptMessage = async (pub_key: string, text: string) => {
  const publicKey = await openpgp.readKey({
    armoredKey: pub_key,
  });
  const messageForMe = await openpgp.createMessage({
    text,
  });
  const encryptMessageForMe = await openpgp.encrypt({
    message: messageForMe,
    encryptionKeys: publicKey,
  });
  return encryptMessageForMe;
};

export const dencryptMessage = async (
  privateKeyArmored: string,
  encrypted_text: string,
) => {
  const msg = await openpgp.readMessage({
    armoredMessage: encrypted_text, // parse armored message
  });
  const readKey = await openpgp.readPrivateKey({
    armoredKey: privateKeyArmored,
  });

  const dencryptMessageForMe = await openpgp.decrypt({
    message: msg,
    decryptionKeys: readKey,
  });
  return dencryptMessageForMe;
};
