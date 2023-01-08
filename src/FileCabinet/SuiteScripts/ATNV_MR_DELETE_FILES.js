/**
 * Script Type: Map Reduce
 * File Name: ATNV_MR_DELETE_FILES.js
 * Script:	ATNV | MR | Delete Files  [customscript_atnv_mr_delete_files]
 * 				Parameter: Saved Search [custscript_atnv_param_files_to_delete]
 * Deployment:	ATNV | MR | Delete Files   [customdeploy_atnv_mr_delete_files]
 * Search : 2665  
 * Description: This Script deletes the Files and Folders based on the saved Search Defined in the Script Paramter
 * Ticket: FS-276
 * * 
 * Date			Author	            Remarks				Version
 * 11-25-2022   Janardhan S			Initial				1.0
 * 
 */

/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/email', 'N/runtime', 'N/error', 'N/file'],
	function (search, record, email, runtime, error, file) {
		// Start Of GetInput Data
		function getInputData(context) {
			try {
				var scriptObj = runtime.getCurrentScript();
				var foldersearch = scriptObj.getParameter({
					name: 'custscript_atnv_param_files_to_delete'
				});
			 var folSearchObj =  search.load({
										id: foldersearch
											}); 
                return folSearchObj;
			} catch (error) {
				log.error({
					title: 'error',
					details: error
				});
				throw error;
			}
		}


		function map(context) {
			try {
				var values = JSON.parse(context.value);
				log.debug('values',values);
				var getNumOfFiles;
				
				var folderId = values.id;
				var recType = values.recordType;
								log.debug('values',values);
								log.debug('recType',recType);
					
				var numOfFiles = values.values.numfiles;
				var fileInternalId = values.values["internalid.file"].value;
												log.debug('numOfFiles',numOfFiles);
												log.debug('fileInternalId',fileInternalId);
												
					 
                    file.delete({
							id: fileInternalId
						});
												  
				
				var folderSearchObj = search.create({
									   type: "folder",
									   filters:
									   [
										  ["internalid","anyof",folderId]
									   ],
									   columns:
									   [
										  search.createColumn({name: "numfiles", label: "# of Files"})
									   ]
									});
									var searchResultCount = folderSearchObj.runPaged().count;
									log.debug("folderSearchObj result count",searchResultCount);
									folderSearchObj.run().each(function(result){
									  getNumOfFiles	 = result.getValue('numfiles');								   
									return true;
									});
             if(getNumOfFiles == 0)
			 {				 
				var folderObj = record.delete({
										type: record.Type.FOLDER,
										id: folderId
										});
			 }
			/*
			//	var cusDataBaseId = values.values.custentity_scg_db_id;
				var cusDataBaseId = values.values["custentity_scg_db_id.CUSTRECORDZAB_S_CUSTOMER"];
												log.debug('cusDataBaseId',cusDataBaseId);

              
 				record.submitFields({
							type: recType,
							id: zabId,
							values: {
							     custrecord_scg_db_id: cusDataBaseId
							},
							options: {
								enableSourcing: false,
								ignoreMandatoryFields : true
							}
							});
			*/
								
				context.write(context.key, context.value);

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
			map: map,
			summarize: summarize
		};
	});