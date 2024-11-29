---
layout: post
title: Writeup for UNLOCK TRAIN DATA in Hacky Holidays 2022
language: en-DE
place: Frankfurt am Main, Deutschland
---

This is a writeup for the challenge "UNLOCK TRAIN DATA" in Hacky Holidays 2022 hosted by Deloitte. The challenge is a reverse engineering challenge and the goal is to decrypt the flag from the APK file.

**Table of Contents**
* .
{:toc}

## Gathering information

What we have here is a `travelportal.apk` file, so the first thing coming into my mind is to decompile it. Basically, `.apk` extension is for Android package and the file is in a zip archive format. Extracting it we can see the classes?.dex which is the compiled byte code and also the other non-executable resources.

Here I feed the package directly to `jadx` to unpack the resources and decompile the byte code to Java source code.

```bash
jadx travelportal.apk
```

Then we get all the resources and the decompiled source code sucessfully and the readability of the generated Java code is pretty good. The structure of the result is as follows:

```bash
.
├── resources     # non-executable resources, majorly pictures and XML files
└── sources
    ├── android   # Let's skip the first three directories for now, assuming
    ├── androidx  # they are system libraries that are not relevant to this
    ├── com       # problem
    └── nl
        └── picobello
            └── itconsulting
                ├── crypto
                │   └── Paupercrypt.java
                └── travelportal
                    ├── AboutActivity.java
                    ├── BuildConfig.java
                    ├── databinding
                    │   ├── ActivityAboutBinding.java
                    │   └── ActivityMainBinding.java
                    ├── MainActivity.java
                    ├── R.java
                    └── TicketVerification.java
```

We notice a file named `Paupercrypt.java`. Searching this name on the internet we got no other information. It's very likely to be a self-invented encryption and decryption algorithm and very likely to be the vulnerability we need to attack.

Reading through the source code we found that in `MainActivity.java`, `TicketVerification.checkTicket()` is called with two strings and results in different behaviours indicating 'ticket' valid or not:

```java
// /sources/nl/picobello/itconsulting/travelportal/MainActivity.java Line 44-48
if (TicketVerification.checkTicket(MainActivity.this.binding.nameInput.toString(), MainActivity.this.binding.ticketInput.toString())) {
    Toast.makeText(MainActivity.this.getApplicationContext(), "Valid Ticket", 1).show();
} else {
    Toast.makeText(MainActivity.this.getApplicationContext(), "TICKET INVALID", 1).show();
}
```

Also, there is a click event listener which changes the background according to the click count:

```java
// /sources/nl/picobello/itconsulting/travelportal/MainActivity.java Line 58-69
if (MainActivity.this.clickCounter == -1) {
    MainActivity.this.binding.backgroundImage.setImageBitmap(BitmapFactory.decodeResource(MainActivity.this.getResources(), R.drawable.ticket));
}
if (MainActivity.this.clickCounter >= 25) {
    try {
        MainActivity.this.binding.backgroundImage.setImageBitmap(TicketVerification.getDebugInfo(MainActivity.this.getResources().openRawResource(R.raw.debug)));
    } catch (IOException e) {
         e.printStackTrace();
    }
    MainActivity.this.clickCounter = -1;
    return;
}
```

Under `/resources/res/drawable-nodpi/` we can find `ticket.png` and it seems to be a normal background image. However, `/resources/res/raw/debug` is a binary file which cannot be directly decoded as an image. Therefore the must be some decoding in `TicketVerification.getDebugInfo()`.

Both the two suspiciousness lead us to `TicketVerification.java`. Let's see what is happening here.

In `TicketVerification.java`, the most eye-grabbing line is that it has a private string variable called `MASTER_TICKET_HEX`, and the method `checkTicket()` also leaks the information that the second parameter is in fact the flag.

```java
// /sources/nl/picobello/itconsulting/travelportal/TicketVerification.java Line 11-17
static final String MASTER_TICKET_HEX = "b9725f22659b4469f84b4b800b740379bcafbb1fee9c941c0cca89a9ac2718f52e03df787f41bc568a63353b0084b956dc7a1ff0a58d88e20594c4fab8ee5df86e3da18d2ddcb579ff664636fa5a8e583ad2d35e7fe986f78754c7377a4f95a55aae80992da22547123374ea13235d9fc34e846f69b876a8e80d211f19b1c7a32ed4e48101b91448b5d5f9b5fe02488410015780353e14a9ef726073197d1377";

public static boolean checkTicket(String keyStr, String flagStr) throws Exception {
    byte[] result = Paupercrypt.encrypt(keyStr.getBytes(), flagStr.getBytes());
    System.out.println(toHex(result));
    return toHex(result).equals(MASTER_TICKET_HEX);
}
```

Basically. it's telling us that the ticket is valid when calling `Paupercrypt.encrypt()` with the two strings returns the same hex value as `MASTER_TICKET_HEX`. So if we can somehow decrypt the `MASTER_TICKET_HEX`, we know the flag string.

The other function, `getDebugInfo()` is simply applying XOR with the `MASTER_TICKET_HEX` to the input file stream.

## Decrypting the `MASTER_TICKET_HEX`

Looking into `Paupercrypt.java`, we found no implementation of decryption. The encryption is done as follows:

1. Generate a key from the first parameter by selecting three numbers from its hash, and then hash the key;
1. Use the hashed key to encrypt the input, which is initially the second parameter, and hash the key once more;
1. Repeat step 2 for 8 times, and return the encrypted result

The encryption is using AES/ECB/PKCS5Padding and the hash is using default MD5.

This encryption has two problems, first is that the actual key being used is generated from 3 bytes, which reduces the key space to 256^3=16777216 possible passwords. This allows enumeration and it won't take a lot of time.

Second, the key is changing in each round but it's independent of the input, which means, in each round, it's performing `AES_ECB_encrypt(data, hash^n(key))`, where `hash^n(key)` means hashing the key `n` times, `n` is the round number. Once the initial key is decided, we know the key used in each round. AES/ECB is a symmetric encryption, therefore the whole process is reversible.

So we can enumerate the initial key, calculate the key used in each round, and decrypt the `MASTER_TICKET_HEX` round by round to its original data, which is the flag string.

First, we prepare the `AES_ECB_Decrypt()` helper function by simply copying and pasting the `AES_ECB_Encrypt()` and changing the mode to DECRYPT_MODE when initializing the Cipher instance:

```java
private static byte[] AES_ECB_Decrypt(byte[] in, byte[] key) throws Exception {
    Key aesKey = new SecretKeySpec(key, "AES");
    Cipher encryptCipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
    encryptCipher.init(DECRYPT_MODE, aesKey);
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    CipherOutputStream cipherOutputStream = new CipherOutputStream(outputStream, encryptCipher);
    cipherOutputStream.write(in);
    cipherOutputStream.flush();
    cipherOutputStream.close();
    byte[] out = outputStream.toByteArray();
    return out;
}
```

Then we enumerate three bytes as the initial key:

```java
for(int c1 = -128; c1 < 128; c1 += 1) {
    for(int c2 = -128; c2 < 128; c2 += 1) {
        for(int c3 = -128; c3 < 128; c3 += 1) {
            byte[] initial_key = {(byte)c1, (byte)c2, (byte)c3};
            ...
        }
    }
}
```

Calculate the 8 keys in 8 rounds:

```java
byte[][] keys = new byte[8][16];
keys[0] = hash(initial_key);
for(int i = 1; i < 8; i += 1) {
    keys[i] = hash(keys[i - 1]);
}
```

Decrypt the `MASTER_TICKET_HEX` 8 times with the 8 keys generated above in reverse order and print the result:

```java
byte[] currentData = decodeHexString(MASTER_TICKET_HEX);
for(int i = 7; i >= 0; i -= 1) {
    currentData = AES_ECB_Decrypt(currentData, keys[i]);
}
System.out.print(toHex(initial_key));
System.out.print(" ");
System.out.println(toHex(currentData));
```

Method `toHex()` is copied from `/sources/nl/picobello/itconsulting/travelportal/TicketVerification.java` Line 19-29; `decodeHexString()` converts a hex string to bytes array.

Since the AES_ECB_Decrypt doesn't complain about whether the input data is valid, we need to validate the result ourselves. I expect the final key is in `CTF{...}` format, so I pipe the result to grep with `4354467b`, which is the hex format of `CTF{`. The code is fast enough to find the result soon. I did partition the enumeration and let them run on different cores. However, it turned out that it was unnecessary. Converting the matched result back to the ASCII string we get a flag.

If the result doesn't include `CTF{`, I think we can still use the result length to tell whether it's decrypted properly. The correct result has 40 bytes and the most results has only 32 bytes.

## Decrypting raw binary

We simulate what `getDebugInfo()` does, apply the XOR with `MASTER_TICKET_HEX` to the raw binary:

```java
// altered from /sources/nl/picobello/itconsulting/travelportal/TicketVerification.java Line 32-48
byte[] data = new byte[204800];
int stringLength = MASTER_TICKET_HEX.length();
char[] array = MASTER_TICKET_HEX.toCharArray();
File iFile = new File("debug");
FileInputStream is = new FileInputStream(iFile);
File oFile = new File("output");
FileOutputStream os = new FileOutputStream(oFile);
int read = is.read(data);
int index = 0;
while (read != -1) {
    for (int k = 0; k < read; k++) {
        data[k] = (byte) (data[k] ^ array[index % stringLength]);
        index++;
    }
    os.write(data, 0, read);
    read = is.read(data);
}
os.flush();
os.close();
is.close();
```

The result starts with `89 50 4E 47 0D 0A 1A 0A` which indicates it's a `png` file. Open it as png and it reveals another flag.

## Conclusion

Inventing a new cryptologic algorithm requires Mathematics proofs to promise security. We shouldn't arbitrarily construct such algorithms especially when the source code is accessible to the public. Besides symmetric keys shouldn't be saved on the client side. It's a better practice to use an asymmetric encryption. This is my first time doing Android reverse engineering and it is pretty much fun.

## LICENSE

This article and its contents, except what is cited, are published under [CC0](https://creativecommons.org/publicdomain/zero/1.0/legalcode). 
