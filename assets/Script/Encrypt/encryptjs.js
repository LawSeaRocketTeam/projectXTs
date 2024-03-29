/*!
 * Copyright (c) 2015 Sri Harsha <sri.harsha@zenq.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function (name, definition) {
    if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else if (typeof define === 'function' && typeof define.petal === 'object') {
        define(name, [], definition);
    } else {
        this[name] = definition();
    }
})('encryptjs', function (encryptjs) {

    'use strict';
    //var readline = require('readline');
    //var fs=require('fs');
    var rl;
    rl = null;
    //Electron doesnt support stdin, so dont setup CLI if its not available.
    // try {
    //     rl = readline.createInterface({
    //         input: process.stdin,
    //         output: process.stdout
	// 		  });
    // } catch (e) {
    //     rl = null;
    //     console.log('Command line is not supported on this platform', e);
    // }
    encryptjs = { version: '1.0.0' };

    //Right before exporting the validator object, pass each of the builtins
    //through extend() so that their first argument is coerced to a string
    encryptjs.init = function () {
        console.log("--------------------Applying Encryption Algorithm------------------ ");
    };
    'use strict';
    if (typeof module!='undefined' && module.exports) var Algo = require('./algo'); // CommonJS (Node.js)

    encryptjs.encrypt = function(plaintext, password, nBits) {
        var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4)
        if (!(nBits==128 || nBits==192 || nBits==256)) return ''; // standard allows 128/192/256 bit keys
        plaintext = String(plaintext).utf8Encode();
        password = String(password).utf8Encode();

        // use AES itself to encrypt password to get cipher key (using plain password as source for key
        // expansion) - gives us well encrypted key (though hashed key might be preferred for prod'n use)
        var nBytes = nBits/8;  // no bytes in key (16/24/32)
        var pwBytes = new Array(nBytes);
        for (var i=0; i<nBytes; i++) {  // use 1st 16/24/32 chars of password for key
            pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
        }
        var key = Algo.cipher(pwBytes, Algo.keyExpansion(pwBytes)); // gives us 16-byte key
        key = key.concat(key.slice(0, nBytes-16));  // expand key to 16/24/32 bytes long

        // initialise 1st 8 bytes of counter block with nonce (NIST SP800-38A �B.2): [0-1] = millisec,
        // [2-3] = random, [4-7] = seconds, together giving full sub-millisec uniqueness up to Feb 2106
        var counterBlock = new Array(blockSize);

        var nonce = (new Date()).getTime();  // timestamp: milliseconds since 1-Jan-1970
        var nonceMs = nonce%1000;
        var nonceSec = Math.floor(nonce/1000);
        var nonceRnd = Math.floor(Math.random()*0xffff);
        // for debugging: nonce = nonceMs = nonceSec = nonceRnd = 0;

        for (var i=0; i<2; i++) counterBlock[i]   = (nonceMs  >>> i*8) & 0xff;
        for (var i=0; i<2; i++) counterBlock[i+2] = (nonceRnd >>> i*8) & 0xff;
        for (var i=0; i<4; i++) counterBlock[i+4] = (nonceSec >>> i*8) & 0xff;

        // and convert it to a string to go on the front of the ciphertext
        var ctrTxt = '';
        for (var i=0; i<8; i++) ctrTxt += String.fromCharCode(counterBlock[i]);

        // generate key schedule - an expansion of the key into distinct Key Rounds for each round
        var keySchedule = Algo.keyExpansion(key);

        var blockCount = Math.ceil(plaintext.length/blockSize);
        var ciphertxt = new Array(blockCount);  // ciphertext as array of strings

        for (var b=0; b<blockCount; b++) {
            // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
            // done in two stages for 32-bit ops: using two words allows us to go past 2^32 blocks (68GB)
            for (var c=0; c<4; c++) counterBlock[15-c] = (b >>> c*8) & 0xff;
            for (var c=0; c<4; c++) counterBlock[15-c-4] = (b/0x100000000 >>> c*8);

            var cipherCntr = Algo.cipher(counterBlock, keySchedule);  // -- encrypt counter block --

            // block size is reduced on final block
            var blockLength = b<blockCount-1 ? blockSize : (plaintext.length-1)%blockSize+1;
            var cipherChar = new Array(blockLength);

            for (var i=0; i<blockLength; i++) {  // -- xor plaintext with ciphered counter char-by-char --
                cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b*blockSize+i);
                cipherChar[i] = String.fromCharCode(cipherChar[i]);
            }
            ciphertxt[b] = cipherChar.join('');
        }

        // use Array.join() for better performance than repeated string appends
        var ciphertext = ctrTxt + ciphertxt.join('');
        ciphertext = ciphertext.base64Encode();

        return ciphertext;
    };

    encryptjs.decrypt = function(ciphertext, password, nBits) {
        var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
        if (!(nBits==128 || nBits==192 || nBits==256)) return ''; // standard allows 128/192/256 bit keys
        ciphertext = String(ciphertext).base64Decode();
        password = String(password).utf8Encode();

        // use AES to encrypt password (mirroring encrypt routine)
        var nBytes = nBits/8;  // no bytes in key
        var pwBytes = new Array(nBytes);
        for (var i=0; i<nBytes; i++) {
            pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
        }
        var key = Algo.cipher(pwBytes, Algo.keyExpansion(pwBytes));
        key = key.concat(key.slice(0, nBytes-16));  // expand key to 16/24/32 bytes long

        // recover nonce from 1st 8 bytes of ciphertext
        var counterBlock = new Array(8);
        var ctrTxt = ciphertext.slice(0, 8);
        for (var i=0; i<8; i++) counterBlock[i] = ctrTxt.charCodeAt(i);

        // generate key schedule
        var keySchedule = Algo.keyExpansion(key);

        // separate ciphertext into blocks (skipping past initial 8 bytes)
        var nBlocks = Math.ceil((ciphertext.length-8) / blockSize);
        var ct = new Array(nBlocks);
        for (var b=0; b<nBlocks; b++) ct[b] = ciphertext.slice(8+b*blockSize, 8+b*blockSize+blockSize);
        ciphertext = ct;  // ciphertext is now array of block-length strings

        // plaintext will get generated block-by-block into array of block-length strings
        var plaintxt = new Array(ciphertext.length);

        for (var b=0; b<nBlocks; b++) {
            // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
            for (var c=0; c<4; c++) counterBlock[15-c] = ((b) >>> c*8) & 0xff;
            for (var c=0; c<4; c++) counterBlock[15-c-4] = (((b+1)/0x100000000-1) >>> c*8) & 0xff;

            var cipherCntr = Algo.cipher(counterBlock, keySchedule);  // encrypt counter block

            var plaintxtByte = new Array(ciphertext[b].length);
            for (var i=0; i<ciphertext[b].length; i++) {
                // -- xor plaintxt with ciphered counter byte-by-byte --
                plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
                plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
            }
            plaintxt[b] = plaintxtByte.join('');
        }

        // join array of blocks into single plaintext string
        var plaintext = plaintxt.join('');
        plaintext = plaintext.utf8Decode();  // decode from UTF8 back to Unicode multi-byte chars

        return plaintext;
    };

    encryptjs.getTextEncryptAndSaveToTextFile = function(filePath,password,nBits) {
        if (!rl) throw Error("Command line not supported on this platform");
        rl.question("Enter the text to be encrypted: ", function(answer) {
            // TODO: Log the answer in a database
            console.log("'"+answer+"' This text will be encrypted and stored in a text file 'encrypted.txt'");
           var cipherText=encryptjs.encrypt(answer,password,nBits);
            fs.writeFile(filePath,cipherText,function(){
                console.log("'encrypted.txt' File created in your local directory, if not present refresh your project");
            });
            rl.close();
        });
    };

    encryptjs.getTextEncryptAndSaveToJSONFile = function(filePath,password,nBits) {
        if (!rl) throw Error("Command line not supported on this platform");
        rl.question("Enter the text to be encrypted: ", function(answer) {
            // TODO: Log the answer in a database
            console.log("'"+answer+"' This text will be encrypted and stored in a text file 'encrypted.txt'");
            var cipherText=encryptjs.encrypt(answer,password,nBits);
            encryptjs.writeCipherTextToJSON(filePath,{EncryptedText:cipherText},function(){
                console.log("'encryptedText.JSON' File created in your local directory, if not present refresh your project");
            });
            rl.close();
        });
    };

    encryptjs.writeCipherTextToJSON=function(file, obj, options, callback) {
        if (callback == null) {
            callback = options;
            options = {}
        }

        var spaces = typeof options === 'object' && options !== null
            ? 'spaces' in options
            ? options.spaces : this.spaces
            : this.spaces;

        var str = '';
        try {
            str = JSON.stringify(obj, options ? options.replacer : null, spaces) + '\n'
        } catch (err) {
            if (callback) return callback(err, null)
        }

        fs.writeFile(file, str, options, callback)
    };

    if (typeof String.prototype.utf8Encode == 'undefined') {
        String.prototype.utf8Encode = function() {
            return unescape( encodeURIComponent( this ) );
        };
    }

    if (typeof String.prototype.utf8Decode == 'undefined') {
        String.prototype.utf8Decode = function() {
            try {
                return decodeURIComponent( escape( this ) );
            } catch (e) {
                return this; // invalid UTF-8? return as-is
            }
        };
    }

    if (typeof String.prototype.base64Encode == 'undefined') {
        String.prototype.base64Encode = function() {
            if (typeof btoa != 'undefined') return btoa(this); // browser
            if (typeof Buffer != 'undefined') return new Buffer(this, 'utf8').toString('base64'); // Node.js
            throw new Error('No Base64 Encode');
        };
    }

    if (typeof String.prototype.base64Decode == 'undefined') {
        String.prototype.base64Decode = function() {
            if (typeof atob != 'undefined') return atob(this); // browser
            if (typeof Buffer != 'undefined') return new Buffer(this, 'base64').toString('utf8'); // Node.js
            throw new Error('No Base64 Decode');
        };
    }

    encryptjs.init();

    return encryptjs;

});
