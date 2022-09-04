const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "./password.proto";

/*
Initializing an object for storing protobuf loader options
- keepCase: Boolean - the protoLoader to maintain protobuf field names. 
- longs / enums : Data types - represent long and enum values. 
- defaults : Boolean - when set to true, sets default values for output objects. 
- oneof : Boolean - virtual oneof properties to field names. 
To find more opions, https://github.com/grpc/grpc-node/tree/master/packages/proto-loader#readme
*/
const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

// Initializing the package definition
var packageDef = protoLoader.loadSync(PROTO_PATH, loaderOptions);

// Calling the grpc-js method, loadPackageDefinition
const grpcObj = grpc.loadPackageDefinition(packageDef);

// Invoking Node.js server
const ourServer = new grpc.Server();

// dummy data
let dummyRecords = {
  passwords: [
    {
      id: "153642",
      password: "default1",
      hashValue: "default",
      saltValue: "default",
    },
    {
      id: "234654",
      password: "default2",
      hashValue: "default",
      saltValue: "default",
    },
  ],
};

/*
The addService method takes in two parameters: the service, and the commands.
Each of the commands takes in a message argument (as defined in the proto file) and a callback function argument. 
- The retrievePasswords method : returns all passwords stored in the object. 
- The addNewDetails method : inserts new password details to the inner array of your object using the Array.prototype.push method from the message request. 
- updatePasswordDetails : updates a password's details.
*/
ourServer.addService(grpcObj.PasswordService.service, {
  /*our protobuf message(passwordMessage) for the RetrievePasswords was Empty. */
  retrievePasswords: (passwordMessage, callback) => {
    callback(null, dummyRecords);
  },
  addNewDetails: (passwordMessage, callback) => {
    const passwordDetails = { ...passwordMessage.request };
    dummyRecords.passwords.push(passwordDetails);
    callback(null, passwordDetails);
  },
  updatePasswordDetails: (passwordMessage, callback) => {
    const detailsID = passwordMessage.request.id;
    const targetDetails = dummyRecords.passwords.find(
      ({ id }) => detailsID == id
    );
    targetDetails.password = passwordMessage.request.password;
    targetDetails.hashValue = passwordMessage.request.hashValue;
    targetDetails.saltValue = passwordMessage.request.saltValue;
    callback(null, targetDetails);
  },
});

// Binding the server to a port and starting it using the bindAsync method.
ourServer.bindAsync(
  "127.0.0.1:4000",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    console.log("Server running at http://127.0.0.1:4000");
    ourServer.start();
  }
);
