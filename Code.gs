//Code.gs START
/*Author: Shawn Hodgson
http://shawnjhodgson.com/2015/06/forms-send-results-to-multiple-recipients
*/
// menu added on open

function onOpen() {

  FormApp.getUi() // Or DocumentApp or FormApp.

      .createMenu('Settings')

      .addItem('Authorize', 'authorize')

      .addItem('Set Email', 'setEmailInfo')  

      .addToUi();

}



//easily authorize the script to run from the menu

function authorize(){
	var respEmail = Session.getActiveUser().getEmail();
	MailApp.sendEmail(respEmail,"Form Authorizer", "Your form has now been authorized to send you emails");
}



function setEmailInfo(){
  var html = HtmlService.createHtmlOutputFromFile('Index').setHeight(500);
  FormApp.getUi().showModalDialog(html, "Email Settings");
}



function processForm(myform){

  var rec = myform.toEmailTB;

  var cc = myform.ccEmailTB;

  var msg =  myform.messageTA;

  var sub = myform.subjectTB;

  setProperty('EMAIL_ADDRESS',rec);

  setProperty('CC_ADDRESS',cc);

  setProperty('EMAIL_SUBJECT',sub);

  setProperty('EMAIL_MESSAGE',msg);

}



//setting script properties

function setProperty(key,property){

  var scriptProperties = PropertiesService.getScriptProperties();

  scriptProperties.deleteProperty(key);

  scriptProperties.setProperty(key,property);

}



//getting script properties

function getProperty(property){

  var scriptProperties = PropertiesService.getScriptProperties();

  var savedProp = scriptProperties.getProperty(property);

  return  savedProp;

}







//function to put it all together

function controller(e){

  var response = e.response;

  var emailTo = getProperty('EMAIL_ADDRESS');  

  var emailSubject = getProperty('EMAIL_SUBJECT');

  var message = getProperty('EMAIL_MESSAGE');

  var cc =   getProperty('CC_ADDRESS');

  var secHeader = true;

  var includeEmpty = false;

  var body;  

  //get questions and responses

  var resp = getResponse(response,secHeader,includeEmpty);

   //format with html

  var msgBodyTable = formatHTML(resp);

  //email

  body = message +  msgBodyTable;

  sendEmail(emailTo,emailSubject,body,cc);



}



//function to send out mail

function sendEmail(emailRecipient,emailSubject,body,ccRecipient){

  MailApp.sendEmail(emailRecipient,emailSubject,"", {htmlBody: body, cc: ccRecipient});

}



//Function get form items and form responses. Builds and and returns an array of quesions: answer.

function getResponse(response,secHeader,includeEmpty){

  var form = FormApp.getActiveForm();

  var items = form.getItems();

  var response = response;

  var itemRes = response.getItemResponses();

  var array = [];  



  for (var i = 0; i < items.length; i++){

    var question = items[i].getTitle();  

    var answer = "";

    //include section headers and description in email only runs when user sets setHeader to true

      if (items[i].getType() == "SECTION_HEADER" && secHeader == true){

        var description = items[i].getHelpText();

        var title = items[i].getTitle();

        var regex = /^\s*(?:[\dA-Z]+\.|[a-z]\)|•)\s+/gm;

        description = description.replace(regex,"<br>");      

        array.push("<strong>" + title + "</strong><br>" + description);

        continue;

      }

   

    //loop through to see if the form question title and the response question title matches. If so push to array, if not answer is left as ""

    for (var j = 0; j < itemRes.length; j++){

      var respQuestion = itemRes[j].getItem().getTitle();

      //itemRes[j].getResponse()

      if (question == respQuestion){      

        if(items[i].getType() == "CHECKBOX"){        

          var answer =  formatCheckBox(itemRes[j].getResponse());      

          break;

        }

        else{

        var answer = itemRes[j].getResponse();

        break;

        }

      }

    }



    //run this block of code if no empty responses are included

    if(includeEmpty == false){

      if(answer != ""){

        array.push("<strong>" + question + "</strong>" + ": " + answer);

      }    

    }

    //run this block of clode if emty responses are included

    else{

       array.push("<strong>" + question + "</strong>" + ": " + answer);

     }

  }



  return array;

}



function formatCheckBox(chkBoxArray){



   for (var i = 0; i < chkBoxArray.length; i++){

     chkBoxArray[i] = "<br>" + chkBoxArray[i];

   }



  return chkBoxArray.join(" ");



}

//formats an array as a table

function formatHTML(array){

 

  var tableStart = "<br><br><html><body><table border=\"1\">";

  var tableEnd = "</table></body></html>";

  var rowStart = "<tr>";

  var rowEnd = "</tr>";

  var cellStart = "<td>";

  var cellEnd = "</td>";



   for (i in array){

     array[i] = rowStart + cellStart + array[i] + cellEnd + rowEnd;

     }



  array  = array.join('');

  array = tableStart + array + tableEnd;



  return array;



}



//Code.gs STOP