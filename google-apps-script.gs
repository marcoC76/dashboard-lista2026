// Google Apps Script - Dashboard API Externo
// Este script se ejecuta de forma independiente y trabaja con cualquier hoja de calculo
// Requiere: Spreadsheet ID y nombre de hoja como parametros

const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI'; // Cambiar por el ID de tu hoja
const SHEET_NAME = 'ListaAlumnos'; // Nombre de la hoja

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doGet(e) {
  // Permitir sobreescribir SPREADSHEET_ID via parametro
  const spreadsheetId = (e && e.parameter && e.parameter.spreadsheetId) || SPREADSHEET_ID;
  const sheetName = (e && e.parameter && e.parameter.sheet) || SHEET_NAME;
  
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Hoja no encontrada: ' + sheetName }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).filter(row => row[0] !== '');
  
  const result = rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const spreadsheetId = payload.spreadsheetId || SPREADSHEET_ID;
    const sheetName = payload.sheet || SHEET_NAME;
    
    if (action === 'updateDelivery') {
      return updateDeliveryStatus(payload, spreadsheetId, sheetName);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Accion no valida' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateDeliveryStatus(payload, spreadsheetId, sheetName) {
  const { studentId, field, status } = payload;
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Hoja no encontrada: ' + sheetName }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const fieldIndex = headers.indexOf(field);
  if (fieldIndex === -1) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Campo no encontrado: ' + field }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const idIndex = headers.indexOf('ID Unico');
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === studentId) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Estudiante no encontrado: ' + studentId }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  sheet.getRange(rowIndex, fieldIndex + 1).setValue(status);
  
  if (field.includes('Estado')) {
    const fechaField = field.replace('Estado', 'Fecha');
    const fechaIndex = headers.indexOf(fechaField);
    if (fechaIndex !== -1 && status === '✅ Entregado') {
      sheet.getRange(rowIndex, fechaIndex + 1).setValue(new Date());
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Actualizado correctamente' }))
    .setMimeType(ContentService.MimeType.JSON);
}
