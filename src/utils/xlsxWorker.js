// Web worker for xlsx operations
importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');

// Input validation function
function validateExcelFile(file) {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only Excel files are allowed.');
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('File size exceeds 10MB limit.');
  }
  
  return true;
}

// Rate limiting implementation
const rateLimit = {
  lastRequest: 0,
  minInterval: 1000, // 1 second between requests
  check() {
    const now = Date.now();
    if (now - this.lastRequest < this.minInterval) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    }
    this.lastRequest = now;
  }
};

self.onmessage = async (e) => {
  try {
    rateLimit.check();
    const { file, action } = e.data;
    
    validateExcelFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Process the workbook based on the action
        let result;
        switch (action) {
          case 'read':
            result = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
            break;
          case 'validate':
            result = validateExcelStructure(workbook);
            break;
          default:
            throw new Error('Invalid action specified');
        }
        
        self.postMessage({ success: true, data: result });
      } catch (error) {
        self.postMessage({ success: false, error: error.message });
      }
    };
    
    reader.onerror = (error) => {
      self.postMessage({ success: false, error: 'Error reading file' });
    };
    
    reader.readAsArrayBuffer(file);
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};

function validateExcelStructure(workbook) {
  // Add your specific validation logic here
  return {
    isValid: true,
    sheetCount: workbook.SheetNames.length,
    firstSheetName: workbook.SheetNames[0]
  };
} 