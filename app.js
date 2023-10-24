/*const express = require('express');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
app.listen(3000, function() {
    console.log("Server is listening on port 3000...");
});


app.get('/', function(req, res) {
    res.send("Hello world!")
});


var router = express.Router();

const multer  = require('multer');
const upload = multer({ dest: '/resources' });

//app.post("/upload_files", upload.array("files"), uploadFiles);
app.post('/upload_files', upload.single('files'), function(req, res){
    console.dir(req.file);
});
function uploadFiles(req, res) {
    console.log(req.body);
    console.log(req.files);
    res.json({ message: "Successfully uploaded files" });
}
*/

const express = require("express") 
const path = require("path") 
const multer = require("multer") 
const app = express() 
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

// View Engine Setup 
app.set("views",path.join(__dirname,"views")) 
app.set("view engine","ejs") 
const JSON_INPUT = require('./receipt.json');
// var upload = multer({ dest: "Upload_folder_name" }) 
// If you do not want to use diskStorage then uncomment it 
	
var storage = multer.diskStorage({ 
	destination: function (req, file, cb) { 
            console.log(file.fieldname);
		// Uploads is the Upload_folder_name 
		cb(null, "uploads") 
	}, 
	filename: function (req, file, cb) { 
	cb(null, file.fieldname + "-" + Date.now()+".docx") 
	} 
}) 
	
var upload = multer({ storage: storage });
// Define the maximum size for uploading 
// picture i.e. 1 MB. it is optional 
const maxSize = 1 * 10000 * 10000; 
	


app.get("/",function(req,res){ 
	res.render("Signup"); 
}) 
	
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
  })

app.post('/upload',upload.single('file'),(req,res)=>{
		console.log("Recieved Req")
      //  console.log(req.file);
        var filename = req.file.filename;
        var doctype = req.body.docgentype;
        var payload = req.body.payload;
        console.log(payload);
	// Error MiddleWare for multer file upload, so if any 
	// error occurs, the image would not be uploaded! 
    const credentials =  PDFServicesSdk.Credentials
        .servicePrincipalCredentialsBuilder()
        .withClientId('cee8fae97a7047b3aeeb75e1d9282504')
        .withClientSecret('p8e-hsa53picCrszRppRMrGM9xLmj6oF4pjd')
        .build();
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);
        const documentMerge = PDFServicesSdk.DocumentMerge,
    documentMergeOptions = documentMerge.options,
    //options = new documentMergeOptions.DocumentMergeOptions(JSON_INPUT, documentMergeOptions.OutputFormat.PDF);
    options = new documentMergeOptions.DocumentMergeOptions(JSON_INPUT, req.body.docgentype);
    const documentMergeOperation = documentMerge.Operation.createNew(options);
    
// Set operation input document template from a source file.
const input = PDFServicesSdk.FileRef.createFromLocalFile("./uploads/"+filename);
documentMergeOperation.setInput(input);
var finalDocument ="./generated/"+filename;
console.log(finalDocument);
documentMergeOperation.execute(executionContext)
    .then(result => result.saveAsFile(finalDocument))
    .catch(err => {
        if(err instanceof PDFServicesSdk.Error.ServiceApiError
            || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
            console.log('Exception encountered while executing operation', err);
        } else {
            console.log('Exception encountered while executing operation', err);
        }
    });
    console.log("Document Generated Successfully");
   // res.send({ "status": "PDF Generated Successfully" });
});
	
// Take any port number of your choice which 
// is not taken by any other process 
app.listen(3000,function(error) { 
	if(error) throw error 
		console.log("Server created Successfully on PORT 8080") 
}) 
