function generatePdf(request, response) {
    var recordId = request.getParameter('id');
    var recordType = request.getParameter('type');
    nlapiLogExecution('debug', 'Requested Record Id', recordId);

    if (!recordId) {
        response.write('ERROR');
        return;
    }
    var record = nlapiLoadRecord(recordType, recordId);
    var subsidiaryId = record.getFieldValue('subsidiary');
    var subsidiary = nlapiLoadRecord('subsidiary', subsidiaryId);
    //var templateFile = nlapiLoadFile('900820'); 2475577
  var templateFile = nlapiLoadFile('2475577');
  

    var renderer = nlapiCreateTemplateRenderer();
    renderer.setTemplate(templateFile.getValue());
    renderer.addRecord('record', record);

    var xml = renderer.renderToString();

    var file = nlapiXMLToPDF(xml);
	response.setContentType("PDF", "Invoice.pdf", "inline");
	response.write(file.getValue());
}