from web3.auto import w3
import binascii
with open('D:/blockchain/test/node1/keystore/UTC--2024-10-27T12-11-15.288599200Z--6863e7e69898b2b8ef7a61f973133defc0b3f662') as keyfile:
   key = keyfile.read()
   private_key = w3.eth.account.decrypt(key, '123')
   print("Privte key: ")
   print(binascii.b2a_hex(private_key).decode('utf-8'))