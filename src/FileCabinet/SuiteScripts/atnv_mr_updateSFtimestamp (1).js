/**
 * Script Type: Map/Reduce
 * File Name: atnv_mr_updateSFtimestamp.js
 * Script:	ATNV | MR | Update SF Timestamp   
 * 
 * Deployment:	ATNV | MR | Update SF Timestamp   
 *
 * Description: This Script Updates Salesforce timestamp on Customer Payment records
 * 
 * Date			Author	Remarks
 * 
 * 
 */

/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/email', 'N/runtime', 'N/error'],
	function (search, record, email, runtime, error) {
		// Start Of GetInput Data
		function getInputData(context) {
			try {
				
			 var customerPymtSrch =  search.load({
				id: 'customsearch_pymt_no_timestamp'
			}); 
                return customerPymtSrch;
			} catch (error) {
				log.error({
					title: 'error',
					details: error
				});
				throw error;
			}
		}


		function reduce(context) {
			try {
				var values = JSON.parse(context.values[0]);
				log.debug('values',values);
				
				var custPaymentId = values.id;
				var recType = values.recordType;
				log.debug('values',values);
				log.debug('recType',recType);
                log.debug('Internal Id',custPaymentId);


				var customerPayment = record.load({
                         type: recType,
                         id: custPaymentId
                     });
                     //UPDATE so FIELDS>
                     
                     customerPayment.save();
								
				//context.write(context.key, context.values.length);

			} catch (error) {

				log.error({
					title: 'mapReduce.summarize',
					details: error
				});
				throw error;
			}

		}

		// Summarize the Results
		function summarize(summary) {
			try {
				var totalRecordsUpdated = 0;
				summary.output.iterator().each(function (key, value) {
					totalRecordsUpdated += parseInt(value);
					return true;
				});
				log.audit('Summary Time', 'Total Seconds: ' + summary.seconds);
				log.audit('Summary Usage', 'Total Usage: ' + summary.usage);
				log.audit('Summary Yields', 'Total Yields: ' + summary.yields);
				log.audit({
					title: 'Total records updated',
					details: totalRecordsUpdated
				});
			} catch (error) {
				log.error({
					title: 'mapReduce.summarize',
					details: error
				});
				throw error;
			}
		}
		return {
			getInputData: getInputData,
			reduce: reduce,
			summarize: summarize
		};
	});