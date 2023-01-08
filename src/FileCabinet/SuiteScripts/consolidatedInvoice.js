/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
 define(['N/runtime', 'N/file', 'N/log', 'N/email', 'N/record'], function(runtime, file, log, email, record) {
    function getInputData() {

        var invoiceCSVFile = 'custscript_mr_file_location';
        var resFileId = runtime.getCurrentScript().getParameter({
            name: invoiceCSVFile
        });

        //log.debug('resFileId', resFileId);

        if (resFileId) {
            //LOAD FILE
            var fileObj = file.load({
                id: resFileId
            });

            var arrLines = fileObj.getContents().split(/\n|\n\r/);
            var sendToMapArray = [];
            //var sendToMapArray = {};

            var eachLine = '';
            //log.debug('arrLines.length', arrLines.length);
            for (var i = 1; i < arrLines.length; i++) {
                eachLine = arrLines[i].replace('\r', '');
                //log.debug('eachLine', eachLine);
                sendToMapArray.push(eachLine.split(','));

            }

            var invoiceJSON = {};

            for (var i = 0; i < sendToMapArray.length; i++) {
                if (invoiceJSON[sendToMapArray[i][0]]) {
                    invoiceJSON[sendToMapArray[i][0]].push(sendToMapArray[i].slice(1));
                } else {
                    //log.debug('sendToMapArray[i]', sendToMapArray[i][0]);
                    // log.debug('sendToMapArray[i].substring(0,1)', sendToMapArray[i]);

                    invoiceJSON[sendToMapArray[i][0]] = [sendToMapArray[i].slice(1)];
                    //log.debug('for loop invoiceJSON[sendToMapArray[i][0]]', invoiceJSON[sendToMapArray[i][0]]);
                }
            }

            //log.debug('invoiceJSON', invoiceJSON);
            return invoiceJSON;
        }
    }

    function map(context) {
        log.debug('map key', context.key);
        log.debug('map value', context.value);

        try {
            var recId = context.key;
            var contextValObj = context.value;

            //log.debug('context.key.length', context.key.length);

            var tempData = contextValObj.replace(/\r?\n|\r/, '');
            tempData = tempData.replace(/\[|\]/g, '');
            var arrOfCoulmns = tempData.split(',');

            var invoice = record.load({
                type: record.Type.INVOICE,
                id: recId,
                isDynamic: true
            });

            log.debug('invoice', invoice);

            for (var i = 0; i < arrOfCoulmns.length; i += 2) {
              //  log.debug('for loop i Value', i);
                var subId = arrOfCoulmns[i];
                var lineId = arrOfCoulmns[i + 1];

                //log.debug('subId and lineId ', subId + ' ' + lineId);

                subId = subId.replace(/\"|\"/g, '');
                lineId = lineId.replace(/\"|\"/g, '');

                subId = subId.toString();
                lineId = lineId.toString();


               // log.debug('inside for loop subId', subId);
              //  log.debug('inside for loop lineId', lineId);

                /*var value = invoice.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcolatt_t_zab_subscription',
                    line: lineId
                });
                //log.debug('ZAB subscription value', value);*/

                invoice.selectLine({
                    sublistId: 'item',
                    line: lineId
                });

                invoice.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcolatt_t_zab_subscription',
                    value: subId,
                });

                invoice.commitLine({
                    sublistId: 'item'
                });

                /*var zabValue = invoice.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcolatt_t_zab_subscription',
                    line: lineId
                });*/
                
            }
          log.debug('After settingZab Value');
            var inoviceId = invoice.save();
            log.debug('inoviceId', inoviceId);
        } catch (err) {
            log.error('INBOUND PROCESS: MAP ', 'ERROR DETAILS : ' + e.toString());

            context.write({
                key: arrOfCoulmns[1],
                value: {
                    'status': 'false',
                    'errorMessage': e.toString(),
                    'recId': arrOfCoulmns[arrOfCoulmns.length - 1]
                }
            });
        }
    }


    function summarize(summary) {
        var type = summary.toString();
        log.audit({
            title: type + ' Usage Consumed ',
            details: summary.usage
        });
        log.audit({
            title: type + ' Concurrency Number ',
            details: summary.concurrency
        });
        log.audit({
            title: type + ' Number of Yields ',
            details: summary.yields
        });

        var contents = '';
        summary.output.iterator().each(function(key, value) {
            contents += (key + ' ' + value + '\n');
            return true;
        });

        // Create the output file
        //
        // Update the name parameter to use the file name of the output file
        var fileObj = file.create({
            name: 'domainCount.txt',
            fileType: file.Type.PLAINTEXT,
            contents: contents
        });

        // Specify the folder location of the output file, and save the file
        //
        // Update the fileObj.folder property with the ID of the folder in
        // the file cabinet that contains the output file
        fileObj.folder = -15;
        fileObj.save();
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
});