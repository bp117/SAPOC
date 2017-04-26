import { Component, OnInit, Input, OnDestroy }   from '@angular/core';

import { FormDataService }  from '../data/formData.service';
import { URLSearchParams,Http,Response } from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/catch';
import {Observable}     from 'rxjs/Observable';
import * as pako from 'pako';

type docType ={
 md5?:string,
        fileName?:string,
        fileSize?:string,
        uploadedDate?:string,
        uploadedBy?:string
    }
@Component ({
    selector:     'mt-wizard-document'
    ,templateUrl: '../documents/documents.component.html'
})

export class DocumentsComponent implements OnInit, OnDestroy {
    title = 'View Documents';
    
    @Input() formData;
      welcome : string;
    games : [{
        game: string,
        platform : string,
        release : string
    }];
    documents:docType[];
    constructor(private formDataService: FormDataService,private http: Http){
        this.welcome = "Display List using ngFor in Angular 2"
        this.documents =[];
        this.games = [{
            game : "Deus Ex: Mankind Divided",
            platform: " Xbox One, PS4, PC",
            release : "August 23"
        },
        {
            game : "Hue",
            platform: " Xbox One, PS4, Vita, PC",
            release : "August 23"
        },
        {
            game : "The Huntsman: Winter's Curse",
            platform: "PS4",
            release : "August 23"
        },
        {
            game : "The Huntsman: Winter's Curse",
            platform: "PS4",
            release : "August 23"
        },
        {
            game : "Deus Ex: Mankind Divided",
            platform: " Xbox One, PS4, PC",
            release : "August 23"
        },
        {
            game : "Hue",
            platform: " Xbox One, PS4, Vita, PC",
            release : "August 23"
        },
        {
            game : "The Huntsman: Winter's Curse",
            platform: "PS4",
            release : "August 23"
        },
        {
            game : "The Huntsman: Winter's Curse",
            platform: "PS4",
            release : "August 23"
        },
        {
            game : "Deus Ex: Mankind Divided",
            platform: " Xbox One, PS4, PC",
            release : "August 23"
        },
        {
            game : "Hue",
            platform: " Xbox One, PS4, Vita, PC",
            release : "August 23"
        },
        {
            game : "The Huntsman: Winter's Curse",
            platform: "PS4",
            release : "August 23"
        },
        {
            game : "The Huntsman: Winter's Curse",
            platform: "PS4",
            release : "August 23"
        },
        {
            game : "Deus Ex: Mankind Divided",
            platform: " Xbox One, PS4, PC",
            release : "August 23"
        },
        {
            game : "Hue",
            platform: " Xbox One, PS4, Vita, PC",
            release : "August 23"
        },
        {
            game : "The Huntsman: Winter's Curse",
            platform: "PS4",
            release : "August 23"
        },
        {
            game : "The Huntsman: Winter's Curse",
            platform: "PS4",
            release : "August 23"
        },
        {
            game : "Deus Ex: Mankind Divided",
            platform: " Xbox One, PS4, PC",
            release : "August 23"
        },
        {
            game : "Hue",
            platform: " Xbox One, PS4, Vita, PC",
            release : "August 23"
        },
        {
            game : "The Huntsman: Winter's Curse",
            platform: "PS4",
            release : "August 23"
        },
        {
            game : "The Huntsman: Winter's Curse",
            platform: "PS4",
            release : "August 23"
        }]
    };

    ngOnInit() {
        console.log('Documents feature loaded!');
        this.formData = this.formDataService.getData();
         var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        
        let body = JSON.stringify({  "jsonrpc": "2.0",  "method": "query",  "params": {    "type": 1,    "chaincodeID": {      "name": "35314e43f59fdc45258f77cb390e77e25020ed5fb61fa2f130d038bda4f342e2700fdba2f4fe2a1c05acd6929ea55e4107b898f38fe8092381d775aef6bef855"    },    "ctorMsg": {      "function": "readDocuments",      "args": [        "1", "13", "VGhpcyBpcyBteSBMT0dJTkZPIGRhdGE="      ]    },    "secureContext": "admin"  },  "id": 0});
       let register = JSON.stringify({  "enrollId": "admin",  "enrollSecret": "e62dd6c67e"});         
             let options = new RequestOptions({ headers: headers, method: "post" });
         this.http.post('https://0fdbd187cd62468ea75191043ba56ec3-vp0.us.blockchain.ibm.com:5002/registrar', register, options)
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                console.log("Login Response",response);
                
            }) .catch((error:any) => Observable.throw(error.json().error || 'Server error')) //...errors if
                         .subscribe();
        
         this.http.post('https://0fdbd187cd62468ea75191043ba56ec3-vp0.us.blockchain.ibm.com:5002/chaincode', body, options)
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                console.log("Response",response);
                var body = response.json();
                console.log("Docs:",JSON.parse(body.result.message));
                let docs = JSON.parse(body.result.message);
                let docsArray=docs.docs;
               // var docsRes:this.doc[]=[];
                //console.log("Decoded:",atob(docs.docs[0]));
                docsArray.forEach((item, index) => {
      this.documents.push(JSON.parse(atob(item)));
});
//this.documents=this.documents.splice(1,this.documents.length-1)
            //  console.log("docsarray:",this.documents.splice(1,this.documents.length-1));  
            }) .catch((error:any) => Observable.throw(error.json().error || 'Server error')) //...errors if
                         .subscribe();
        
    }

openDoc(docs:docType) {
console.log(docs.md5,":",docs.fileName);
 var headers = new Headers();
 var encodedData;
        headers.append('Content-Type', 'application/json');
 let body = JSON.stringify({  "jsonrpc": "2.0",  "method": "query",  "params": {    "type": 1,    "chaincodeID": {      "name": "35314e43f59fdc45258f77cb390e77e25020ed5fb61fa2f130d038bda4f342e2700fdba2f4fe2a1c05acd6929ea55e4107b898f38fe8092381d775aef6bef855"    },    "ctorMsg": {      "function": "read",      "args": [docs.md5,"Reading Data"]    },    "secureContext": "admin"  },  "id": 0});
let options = new RequestOptions({ headers: headers, method: "post" });
 this.http.post('https://0fdbd187cd62468ea75191043ba56ec3-vp0.us.blockchain.ibm.com:5002/chaincode', body, options)
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                console.log("Response Read:",response);
                var body = response.json();
                var pdfData =atob(body.result.message);
             var data = JSON.parse(pdfData);
             console.log("Data:", atob(data.data));
              encodedData = encodeURI(data.data);
              // Decode base64 (convert ascii to binary)
var strData     = atob(data.data);

// Convert binary string to character-number array
var charData    = strData.split('').map(function(x){return x.charCodeAt(0);});

// Turn number array into byte-array
var binData     = new Uint8Array(charData);

// Pako magic
var data :any       = pako.ungzip(binData);

    

            var mediaType = 'application/pdf';
          var blob = new Blob([data.buffer], {type: "application/pdf"});
          var filename = 'test.pdf';
            var fileURL = URL.createObjectURL(blob);
        window.open(fileURL);    
            }) .catch((error:any) => Observable.throw(error.json().error || 'Server error')) //...errors if
                         .subscribe();
        

}


    ngOnDestroy() {
        this.formDataService.setData(this.formData);
    }
}