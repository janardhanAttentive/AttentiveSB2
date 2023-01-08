/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
 /**
 * Ticket: FSP-125
 * Script Type: Map/Reduce Script 
 * File Name: 	Atnv_MR_create_Invoice.js
 * Script Id:   ATNV | MR | Create Invoice  [customscript_atnv_mr_create_invoice]  
 * Deployment Id:  ATNV | MR | Create Invoice [customdeploy_atnv_mr_create_invoice]
 * Parameters: ATNV Get Sales Orders from Suitelet [custscript_atnv_get_sales_order_param] 
 *
 * 
 */
/**
 * Module Description
 * 
 * Version    Date             Author             Remarks
 *  1.00      06,June-2022     Janardhan S         This Script gets the Selected Sales Orders from the Suitelet Script/Page(customscript_atnv_sui_generate_invoice)
 *                                                 creates Invoice Records and sends an email after Completion of Creating Invoices.
 *  1.02      26,August-2022   Janardhan S         Updated the script to set the transaction date based on the selected from the Suitelet Page
 */

define(['N/error', 'N/record', 'N/search', 'N/runtime', 'N/email', 'N/format'], invsnap_adjust);

function invsnap_adjust(error, record, search, runtime, email, format) {
 // Start Of GetInput Data
    function getInputData(context) {

        try {
			var mapArray = new Object();
                 var scriptObj = runtime.getCurrentScript();
					 mapArray = scriptObj.getParameter({name: 'custscript_atnv_get_sales_order_param'});
					 var jsonData = JSON.parse(mapArray);
					  log.debug({
                    title: 'map reduce mapArray',
                    details: jsonData
                           });
			return jsonData;
           } 
		catch (error) {
            log.error({ title: 'error', details: error });
            throw error;
        }
    }
	
	function reduce(context)
	{
		try {
			 log.debug({
                    title: 'map reduce values',
                    details: 'test for reduce'
			  });
			
			  var values=JSON.parse(context.values[0]);
			  
			  log.debug({
                    title: 'map reduce values',
                    details: values.getSoInternalId
			  });
			  
			  	 var getTransactionDate = format.parse({value:values.getTransDate, type: format.Type.DATE});
			  log.debug({
                    title: 'getTransactionDate',
                    details: getTransactionDate
			  });
			  
			  var objRecord = record.transform({
								fromType: record.Type.SALES_ORDER,
								fromId: values.getSoInternalId,
								toType: record.Type.INVOICE,
								isDynamic: true,
								});
		             var recordId = objRecord.save();
					 
					 if(recordId)
					 {
					    record.submitFields({
										type: record.Type.INVOICE,
										id: recordId,
										values: {
										'trandate': getTransactionDate
										}
										});
					 }
										
										
					log.debug({
                    title: 'map reduce recordId',
                    details: recordId
			  });
			        
											
				 context.write(context.key, context.values.length);							
			  
		}
		catch (error) {
			
			var rec = record.create({
							type: 'customrecord_error_rec_invoice_generate',
							isDynamic: true
							});
							rec.setValue({
							fieldId: 'custrecord_atnv_sales_order_id',
							value: values.getSoInternalId
							});
							rec.setValue({
							fieldId: 'custrecord_atnv_error_name',
							value: error.name
							});
							rec.setValue({
							fieldId: 'custrecord_atnv_error_message',
							value: error.message
							});
				var recordId = rec.save();
        //    throw error;
        }
		
	}

	 // Summarize the Results
    function summarize(summary) {
        try {
			var getUser = runtime.getCurrentUser().id;
					log.audit('Summary Time','getUser: '+getUser);
	 var totalRecordsUpdated = 0;
                summary.output.iterator().each(function (key, value)
                    {
                    totalRecordsUpdated += parseInt(value);
                    return true;
                    });
		log.audit('Summary Time','Total Seconds: '+summary.seconds);
    	log.audit('Summary Usage', 'Total Usage: '+summary.usage);
    	log.audit('Summary Yields', 'Total Yields: '+summary.yields);
                log.audit({
                    title: 'Total records updated',
                    details: totalRecordsUpdated
                });
				
				email.send({
						author: 69923,
						recipients: getUser,
						subject: 'Invoice Generation Process Completed',
						body: 'Invoice Generation Process Completed, Successfull Count '+ totalRecordsUpdated,
						});
        } catch (error) {
            log.error({ title: 'mapReduce.summarize', details: error });
            throw error;
        }
    }
	 return {
        getInputData: getInputData,
		reduce: reduce,
        summarize: summarize
    };
}