const grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "./password.proto";
const bcrypt = require("bcrypt");
const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
var grpcObj = protoLoader.loadSync(PROTO_PATH, options);
const PasswordService = grpc.loadPackageDefinition(grpcObj).PasswordService;

// Creating the client stub by passing the server address and the server connection credentials to the service name constructor.
const clientStub = new PasswordService(
  "localhost:4000",
  grpc.credentials.createInsecure()
);

/* Invoking the commands by passing in the messages as the first parameter and the callback function as parameters. 
The retrievePasswords service command illustrates this.
*/
clientStub.retrievePasswords({}, (error, passwords) => {
  //implement your error logic here
  console.log("Retrieve Password");
  console.log(passwords);
});

/* Generate a salt using the bcrypt.genSalt method by passing in the salt rounds you need.
Generate a hash using the bcrypt.hash method by passing in the password and the salt values.
Set the hash and salt values inside the method bodies as shown.
*/
const saltRounds = 10;
let passwordToken = "5TgU76W&eRee!";
let updatePasswordToken = "H7hG%$Yh33";
bcrypt.genSalt(saltRounds, function (error, salt) {
  bcrypt.hash(passwordToken, salt, function (error, hash) {
    clientStub.addNewDetails(
      {
        id: Date.now(),
        password: passwordToken,
        hashValue: hash,
        saltValue: salt,
      },
      (error, passwordDetails) => {
        //implement your error logic here
        console.log("Add new details");
        console.log(passwordDetails);
      }
    );
  });
});
bcrypt.genSalt(saltRounds, function (error, salt) {
  //implement your error logic here
  bcrypt.hash(updatePasswordToken, salt, function (error, hash) {
    //implement your error logic here
    clientStub.updatePasswordDetails(
      {
        /*
                This is one of the defaultIDs of our dummy object's values.
                You can change it to suit your needs
                */
        id: 153642,
        password: updatePasswordToken,
        hashValue: hash,
        saltValue: salt,
      },
      (error, passwordDetails) => {
        //implement your error logic here
        console.log("Update password details");
        console.log(passwordDetails);
      }
    );
  });
});
