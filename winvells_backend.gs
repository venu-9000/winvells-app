// ================================================================
//  WINVELLS — Google Apps Script Backend
//  ----------------------------------------------------------------
//  HOW TO DEPLOY:
//  1. Open sheets.google.com → create a new spreadsheet
//  2. Click Extensions → Apps Script
//  3. Delete all existing code → paste this entire file → Save
//  4. Click Deploy → New Deployment
//     • Type: Web App
//     • Execute as: Me (kvsvenu9000@gmail.com)
//     • Who has access: Anyone
//  5. Click Deploy → Authorize → Allow
//  6. Copy the Web App URL shown → paste into winvells.html BACKEND_URL
// ================================================================

const OWNER_EMAIL = 'kvsvenu9000@gmail.com';
const SHEET_NAME  = 'Winvells Submissions';

// ── Main POST handler ────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const type = data.type || 'Contact';

    saveToSheet(type, data);
    sendOwnerEmail(type, data);
    if (data.userEmail && isValidEmail(data.userEmail)) {
      sendThankYouEmail(type, data);
    }
    return respond({ success: true });
  } catch(err) {
    Logger.log(err);
    return respond({ success: false, error: err.toString() });
  }
}

// Health check
function doGet() {
  return respond({ status: 'Winvells Backend Live', time: new Date().toString() });
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ================================================================
//  1. SAVE TO GOOGLE SHEET
// ================================================================
function saveToSheet(type, data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'Timestamp (IST)', 'Form Type', 'Name', 'Phone', 'Email',
      'Company / Farm', 'Village / Location', 'District', 'State', 'PIN',
      'Crop / Product', 'Quantity', 'Method / Form Type',
      'GST Number', 'Payment Mode', 'Delivery Address',
      'Message / Details', 'Notes'
    ];
    const hRow = sheet.getRange(1, 1, 1, headers.length);
    sheet.appendRow(headers);
    hRow.setBackground('#1a5c2a').setFontColor('#fff')
        .setFontWeight('bold').setFontSize(10)
        .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    [155,110,140,125,195,150,165,120,100,70,175,100,155,110,100,200,230,200]
      .forEach((w,i) => sheet.setColumnWidth(i+1, w));
  }

  const ts = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy HH:mm:ss');

  let row;
  if (type === 'Order') {
    row = [ts,'🛒 Order',data.name,data.phone,data.userEmail,
           '','','','','',
           (data.product||'') + (data.size ? ' ('+data.size+')' : ''),
           data.quantity,'',
           '',data.payment,data.address,
           'Total: '+(data.total||''), data.notes||''];
  } else if (type === 'Farmer') {
    row = [ts,'🌾 Farmer Reg.',data.name,data.phone,data.userEmail,
           '',data.village||data.location||'',data.district||'',data.state||'',data.pin||'',
           data.crop,data.quantity,data.farmingMethod||'',
           '','','',data.details||'',''];
  } else if (type === 'Company') {
    row = [ts,'🏭 Company Enq.',data.name,data.phone,data.userEmail,
           data.company||'',data.location||'','','','',
           data.product,data.quantity,data.form||'',
           data.gst||'','','',data.details||'',''];
  } else {
    row = [ts,'📩 Contact Us',data.name,data.phone,data.userEmail,
           '','','','','',
           '','','',
           '','','',data.message||'',data.enquiryType||''];
  }

  sheet.appendRow(row);
  const lastRow = sheet.getLastRow();

  const typeColor = {Order:'#1a5c2a',Farmer:'#2d7a2d',Company:'#7a6000',Contact:'#1a3a7a'};
  const rowColor  = {Order:'#edf7ee',Farmer:'#edf7ee',Company:'#fffbea',Contact:'#eef2ff'};
  sheet.getRange(lastRow,2).setBackground(typeColor[type]||'#333')
       .setFontColor('#fff').setFontWeight('bold').setHorizontalAlignment('center');
  if (lastRow % 2 === 0) {
    for (let c=1;c<=18;c++) {
      if (c!==2) sheet.getRange(lastRow,c).setBackground(rowColor[type]||'#f9f9f9');
    }
  }
}

// ================================================================
//  2. EMAIL TO YOU (OWNER)
// ================================================================
function sendOwnerEmail(type, data) {
  const label = {Order:'🛒 New Product Order',Farmer:'🌾 New Farmer Registration',
                 Company:'🏭 New Company Enquiry',Contact:'📩 New Contact Message'};
  const color = {Order:'#1a5c2a',Farmer:'#2d7a2d',Company:'#a07800',Contact:'#1a3a9a'};
  const ts    = Utilities.formatDate(new Date(),'Asia/Kolkata','dd MMM yyyy, hh:mm a');

  const row = (l,v) => (!v||!v.toString().trim()) ? '' :
    '<tr><td style="padding:8px 14px;background:#f4fbf5;color:#2d5a35;font-weight:700;width:34%;'+
    'border-bottom:1px solid #ddeee2;font-size:13px;vertical-align:top">'+l+'</td>'+
    '<td style="padding:8px 14px;color:#111;border-bottom:1px solid #ddeee2;'+
    'font-size:13px;vertical-align:top">'+v+'</td></tr>';

  let rows = row('Name',data.name) + row('Phone',data.phone) + row('Email',data.userEmail);

  if (type==='Order') {
    rows += row('Product',data.product) + row('Size',data.size) +
            row('Quantity',data.quantity+' pack(s)') + row('Total',data.total) +
            row('Payment',data.payment) + row('Address',data.address) + row('Notes',data.notes);
  } else if (type==='Farmer') {
    rows += row('Village',data.village||data.location) + row('District',data.district) +
            row('State',data.state) + row('PIN',data.pin) + row('Crop',data.crop) +
            row('Quantity',data.quantity) + row('Farming Method',data.farmingMethod) +
            row('Details',data.details);
  } else if (type==='Company') {
    rows += row('Company',data.company) + row('Location',data.location) +
            row('Product Needed',data.product) + row('Qty/Month',data.quantity) +
            row('Form Required',data.form) + row('GST',data.gst) + row('Details',data.details);
  } else {
    rows += row('Enquiry Type',data.enquiryType) + row('Message',data.message);
  }

  const html =
    '<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;'+
    'border-radius:12px;overflow:hidden;border:1px solid #d4e8d8">'+
    '<div style="background:'+color[type]+';padding:22px 28px">'+
    '<h2 style="color:#fff;margin:0;font-size:17px">'+label[type]+'</h2>'+
    '<p style="color:rgba(255,255,255,0.7);margin:5px 0 0;font-size:12px">'+
    'Received: '+ts+' IST · Winvells Website</p></div>'+
    '<table style="width:100%;border-collapse:collapse">'+rows+'</table>'+
    '<div style="background:'+color[type]+';padding:12px 20px;text-align:center">'+
    '<p style="color:rgba(255,255,255,0.75);font-size:11px;margin:0">'+
    'Reply to this email to respond directly to the user · '+
    'Check Google Sheet for all submissions</p></div></div>';

  const opts = {htmlBody:html, name:'Winvells Website'};
  if (data.userEmail && isValidEmail(data.userEmail)) opts.replyTo = data.userEmail;
  GmailApp.sendEmail(OWNER_EMAIL, '[Winvells] '+label[type]+' from '+data.name, '', opts);
}

// ================================================================
//  3. THANK-YOU EMAIL TO USER
// ================================================================
function sendThankYouEmail(type, data) {
  const cfg = {
    Order:{
      emoji:'🛒', title:'Order Received!',
      intro:'Thank you for ordering <strong>'+(data.product||'your product')+
            (data.size?' ('+data.size+')':'')+
            '</strong>. We have received your order successfully.',
      next:'Our team will call you on <strong>'+data.phone+
           '</strong> within <strong>24 hours</strong> to confirm and arrange delivery.'
    },
    Farmer:{
      emoji:'🌾', title:'Registration Received!',
      intro:'Thank you for registering with Winvells as a natural farmer. '+
            'We deeply value farmers who follow traditional, chemical-free farming methods.',
      next:'Our team will contact you at <strong>'+data.phone+
           '</strong> within <strong>2 business days</strong> to discuss pricing and next steps.'
    },
    Company:{
      emoji:'🏭', title:'Enquiry Received!',
      intro:'Thank you for your bulk supply enquiry for <strong>'+(data.product||'natural products')+
            '</strong>. We have noted your requirement and our team is reviewing it.',
      next:'We will reach out at <strong>'+data.phone+
           '</strong> or via email within <strong>1 business day</strong> with pricing and availability.'
    },
    Contact:{
      emoji:'📩', title:'Message Received!',
      intro:'Thank you for reaching out to Winvells. We have received your message and our team will review it shortly.',
      next:'We will get back to you at <strong>'+data.phone+
           '</strong> or via this email within <strong>24 hours</strong>.'
    }
  };

  const c = cfg[type] || cfg.Contact;
  const html =
    '<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto">'+

    // Header
    '<div style="background:linear-gradient(135deg,#1a5c2a,#2d8a47);'+
    'padding:30px 32px;border-radius:12px 12px 0 0;text-align:center">'+
    '<div style="font-size:36px;margin-bottom:8px">'+c.emoji+'</div>'+
    '<h1 style="color:#fff;margin:0;font-size:20px">🌿 Winvells</h1>'+
    '<p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:11px;letter-spacing:1px">'+
    'NATURAL FARMING · PURE PRODUCTS</p></div>'+

    // Body
    '<div style="background:#f4fbf5;padding:32px;border:1px solid #d4e8d8;border-top:none">'+
    '<h2 style="color:#1a5c2a;margin:0 0 18px;font-size:18px">'+c.title+'</h2>'+
    '<p style="color:#111;font-size:14px;margin:0 0 12px;line-height:1.7">'+
    'Dear <strong>'+data.name+'</strong>,</p>'+
    '<p style="color:#2d4a30;font-size:14px;margin:0 0 18px;line-height:1.7">'+c.intro+'</p>'+

    // Next steps box
    '<div style="background:#fff;border-left:4px solid #1a5c2a;padding:14px 18px;'+
    'border-radius:0 8px 8px 0;margin:0 0 20px">'+
    '<p style="margin:0 0 4px;font-size:11px;font-weight:800;color:#1a5c2a;'+
    'text-transform:uppercase;letter-spacing:0.5px">What happens next?</p>'+
    '<p style="margin:0;color:#2d4a30;font-size:13px;line-height:1.7">'+c.next+'</p></div>'+

    // Reference
    '<div style="background:#e8f5ec;border-radius:8px;padding:14px 18px;margin-bottom:20px">'+
    '<p style="margin:0;font-size:12px;color:#3d5a45;line-height:1.8">'+
    '<strong>Submission Reference:</strong><br>'+
    'Type: <strong>'+type+'</strong> &nbsp;·&nbsp; '+
    'Name: <strong>'+data.name+'</strong> &nbsp;·&nbsp; '+
    'Phone: <strong>'+data.phone+'</strong></p></div>'+

    '<p style="color:#5a7a5e;font-size:13px;line-height:1.7;margin:0">'+
    'For urgent queries, reply to this email or write to us at '+
    '<a href="mailto:kvsvenu9000@gmail.com" style="color:#1a5c2a;font-weight:700">'+
    'kvsvenu9000@gmail.com</a></p></div>'+

    // Footer
    '<div style="background:#1a5c2a;padding:16px 24px;border-radius:0 0 12px 12px;text-align:center">'+
    '<p style="color:rgba(255,255,255,0.6);font-size:10px;margin:0;letter-spacing:0.5px">'+
    '© Winvells · 100% Natural · FSSAI Approved · No Preservatives · Direct from Farmers'+
    '</p></div></div>';

  GmailApp.sendEmail(data.userEmail,
    '[Winvells] '+c.title+' — Thank you, '+data.name+'!', '',
    {htmlBody:html, name:'Winvells'});
}

// ── Utility ──────────────────────────────────────────────────────
function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim());
}
