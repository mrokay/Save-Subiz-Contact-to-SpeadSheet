//Cài đặt.

var SUBIZ_Verification_key = 'sehqmhorwqddnomqkftuegjjsiprldjjhpwlow'; //Copy từ mã Verification_key trên màn hình thiết lập Webhook của Subiz Automation.
var SpreadSheetFileId = '1oqMy40VZufLSZ7s1xTccA8EXNed8zIGjRLgwKr_CH1E'; //Mã ID của file sheet lưu thông tin.
var sheetName = 'Data';

//Cài đặt thứ tự cột dữ liệu trên file Sheet. Ví dụ dưới: Fullname sẽ là cột số 1.
var configColumn = {
  'fullname' : 1,
  'phones' : 2,
  'emails': 3,
  'trace_city_name' : 4,
  'trace_country_name': 5
};


//Để nhận dữ liệu webhook.
function doPost(e) {
  if (!e || !e.postData || typeof e.postData.contents != 'string' ) return ContentService.createTextOutput({'error': 1}).setMimeType(ContentService.MimeType.JSON);
  var data = JSON.parse(e.postData.contents);
  
  //Lấy thông tin User từ data.
  if (!data[0] || !data[0].data || !data[0].data.automation_event) return ContentService.createTextOutput({'error': 1}).setMimeType(ContentService.MimeType.JSON);
  var user = data[0].data.automation_event.user;
  
  //Kết nối SpreadSheet. 
  var spreadsheet = SpreadsheetApp.openById(SpreadSheetFileId);
  if (typeof spreadsheet != 'object') return ContentService.createTextOutput({'error': 1}).setMimeType(ContentService.MimeType.JSON);
  var sheet = spreadsheet.getSheetByName(sheetName);;
  if (typeof sheet != 'object') return ContentService.createTextOutput({'error': 1}).setMimeType(ContentService.MimeType.JSON);
  var theRow = sheet.getLastRow() + 1;
  
  //Khai báo các loại dự liệu.
  var typeOfData = ['number','text','datetime','boolean'];
  
  for (var i in user.attributes) {
    var attribute = user.attributes[i];
    if (!configColumn[attribute.key]) continue;
    var range = sheet.getRange(theRow,configColumn[attribute.key]);
    
    for (var j = 0; j< typeOfData.length; j++) {
      if (attribute[typeOfData[j]]) {
        range.setValue(attribute[typeOfData[j]]);
        break; 
      }
    }
  }
  return ContentService.createTextOutput({'success':1}).setMimeType(ContentService.MimeType.JSON);
}


//Để xác thực Webhook.
function doGet(e) {
  //Xác thực Subiz Webhook.
  if(e.parameter["subiz_challenge"] && e.parameter["subiz_verify"] && e.parameter["subiz_timestamp"]){
    var signature = Utilities.computeHmacSha256Signature(e.parameter["subiz_timestamp"] + e.parameter["subiz_challenge"], SUBIZ_Verification_key);
    var sig = signature.reduce(function(str,chr){
      chr = (chr < 0 ? chr + 256 : chr).toString(16);
      return str + (chr.length==1?'0':'') + chr;
    },'');
    return ContentService.createTextOutput(sig);
  }
  return ContentService.createTextOutput("");
}
