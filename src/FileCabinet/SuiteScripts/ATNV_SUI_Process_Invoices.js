/**
 * Ticket: FSP-125
 * File Name: Atnv_Sui_generate_Invoices.js
 * Script Id:  Atnv | Sui | Generate Invoices  [customscript_atnv_sui_generate_invoice]  
 * Deployment Id:  Atnv | Sui | Generate Invoices [customdeploy_atnv_sui_generate_invoice]
 *                               
 */
/**
 * Module Description
 * 
 * Version    Date             Author             Remarks
 *  1.00      21,June-2022     Janardhan S         This Script gets the list of Sales Orders which need to generate Invoices.
 *
 */
/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
	 define(['N/record', 'N/runtime', 'N/error', 'N/search', 'N/task', 'N/ui/serverWidget', 'N/ui/dialog', 'N/redirect', 'N/format', 'N/url'],
		function(record, runtime, error, search, task, serverWidget, dialog, redirect, format, url) {
			function onRequest(context) {
					var request = context.request;
					var response = context.response;
					
					var intEmailTemplate = context.request.parameters.custpage_emailtemplate;

				
				log.debug('intEmailTemplate',intEmailTemplate);
					 
				 
					if (request.method == 'GET')
					{
												
						var form = serverWidget.createForm({title: 'One Off Invoice Bulk Processing',hideNavBar: false});
						
						//	form.clientScriptFileId  = 1248176;
		
			form.addFieldGroup({
							id : 'message',
							label : 'Message'
							});
			
			// create header fields

			 var fldEmailTemplate = form.addField({id: 'custpage_emailtemplate',type: serverWidget.FieldType.SELECT,source:'emailtemplate',label: 'Email Template',container:'message'});
			                 fldEmailTemplate.isMandatory = true;

						if(intEmailTemplate)
						{
						  fldEmailTemplate.defaultValue = intEmailTemplate;	
						}
						
		   
					var sblstConfig = buildConfigSublist({
					form: form
						});
				
					var TransactionData = getData();
				log.debug({title: 'Transaction_data',details: JSON.stringify(TransactionData)});
				
				
				var getCount;

				//POPULATE SUBLIST
				for (var i = 0; i < TransactionData.length; i++) {
					

					var line = TransactionData[i];
										
					  if(line.internalid != '')
					  {
					    sblstConfig.setSublistValue({id: 'custpage_inv_item',line: i,value: line.internalid});
					  }
					    if(line.invDocNumber != '')
					  {
						 var docNumberLink =  '<a href="' + url.resolveRecord({recordType: 'invoice',recordId: line.internalid,isEditMode: false})+ '">' +line.invDocNumber + '</a>';
					     sblstConfig.setSublistValue({id: 'custpage_inv_tranid',line: i,value: docNumberLink});
					  }
					  if(line.invtranDate != '')
					  {
					     sblstConfig.setSublistValue({id: 'custpage_inv_date',line: i,value: line.invtranDate});
					  }
					  if(line.getCustomer != '')
					  {
						   sblstConfig.setSublistValue({id: 'custpage_inv_customer',line: i,value: line.getCustomer});
					  }
					   
					   if(line.getSubsidiary != '')
					  {
						   sblstConfig.setSublistValue({id: 'custpage_inv_subsidiary',line: i,value: line.getSubsidiary});
					  }
					  if(line.invDeliveryDate != '')
					  {
						   sblstConfig.setSublistValue({id: 'custpage_inv_delivery_date',line: i,value: line.invDeliveryDate});
					  }
					  
					      if(line.invStatus != '')
					  {
					     sblstConfig.setSublistValue({id: 'custpage_inv_status',line: i,value: line.invStatus});
					  }
					  if(line.invDeliveryErr != '')
					  {
					     sblstConfig.setSublistValue({id: 'custpage_inv_error',line: i,value: line.invDeliveryErr});
					  }
					  if(line.invDeliveryType != '')
					  {
						   sblstConfig.setSublistValue({id: 'custpage_inv_delivery_method',line: i,value: line.invDeliveryType});
					  }
					   
					   if(line.invAmount != '')
					  {
					   sblstConfig.setSublistValue({id: 'custpage_inv_amount',line: i,value: line.invAmount});
					  }
				}	
				
						 form.addSubmitButton({label: 'Process Invoices'});
						response.writePage(form);
						
					}
	else{
              try{
				   var getEmailTemplate = context.request.parameters.custpage_emailtemplate;
				  log.debug('getEmailTemplate',getEmailTemplate);
				  
	  	var sched_param = [];	
             var lineCount = context.request.getLineCount({
                             group: 'custpage_inv_list'
                             });
            
            for (var i = 0; i < lineCount; i++) {
        var getProcesscheckbox = context.request.getSublistValue({group: 'custpage_inv_list',name: 'custpage_inv_process',line: i});
                if(getProcesscheckbox === 'T')
                 {
		
		var getInvInternalId =  context.request.getSublistValue({group: 'custpage_inv_list',name: 'custpage_inv_item',line: i});
		var getDocumentNumber =  context.request.getSublistValue({group: 'custpage_inv_list',name: 'custpage_inv_tranid',line: i});
        var getOrderDate = context.request.getSublistValue({group: 'custpage_inv_list',name: 'custpage_inv_date',line: i});
		var getCustomer = context.request.getSublistValue({group: 'custpage_inv_list',name: 'custpage_inv_customer',line: i});	
	    var getSubsidiary =  context.request.getSublistValue({group: 'custpage_inv_list',name: 'custpage_inv_subsidiary',line: i});
		var getDeliveryMethod =  context.request.getSublistValue({group: 'custpage_inv_list',name: 'custpage_inv_delivery_method',line: i});
        var getInvoiceAmt = context.request.getSublistValue({group: 'custpage_inv_list',name: 'custpage_inv_amount',line: i});
		var getStatus = context.request.getSublistValue({group: 'custpage_inv_list',name: 'custpage_inv_status',line: i});
		var getDeliveryDate = context.request.getSublistValue({group: 'custpage_inv_list',name: 'custpage_inv_delivery_date',line: i});
		var getdeliveryErr = context.request.getSublistValue({group: 'custpage_inv_list',name: 'custpage_inv_error',line: i});
            
							
				 sched_param.push({
					 getInvInternalId:getInvInternalId,
                    getDocumentNumber:getDocumentNumber,
					getOrderDate:getOrderDate,
                    getCustomer:getCustomer,
				    getSubsidiary:getSubsidiary,
					getDeliveryMethod:getDeliveryMethod,
                    getInvoiceAmt:getInvoiceAmt,
				    getStatus:getStatus,
					getDeliveryDate:getDeliveryDate,
					getdeliveryErr:getdeliveryErr
				 });
				 
							
	      }
       }
	  
	         sched_param  = JSON.stringify(sched_param);
			       log.debug({title: 'sched_param',details: sched_param});
				   
		var schedTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_atnv_mr_create_invoice',
			params: {'custscript_atnv_get_sales_order_param': sched_param}
			});
			var schTaskId = schedTask.submit();
			var taskStatus = task.checkStatus(schTaskId);
			log.debug('taskStatus', taskStatus);
			
			var form = serverWidget.createForm({title: 'Sales Orders Getting Processed',hideNavBar: false});
			// var html = 'Sales Orders Getting Processed';
    
	response.writePage(form);
         return;
 }
 catch(e)
 {
  log.error({
                    title: 'Error',
                    details: e
                });
 }
   }		
/*   
					}
		catch (e){
					var errString =  e.name + ' : ' + e.message;
					log.error({ title: 'NS | SL | Modify UBP USP', details: errString });
					var msg = 'OOPS. Something didnt work :(';
					if ( errString != null ){
						msg += '<br>' + errString;
					}
					var form = serverWidget.createForm({ title: msg });                
					context.response.writePage(form);
				}
				*/
				return;
			}
			
			function DateNow()
			{
					var today = new Date();
					var dd = today.getDate();
					var mm = today.getMonth()+1;
					var yyyy = today.getFullYear();
					today = dd+'/'+mm+'/'+yyyy; // change the format depending on the date format preferences set on your account
					return today;
					  }
			
			function _logValidation(value) {
				if (value != null && value != '' && value != undefined && value.toString() != 'NaN' && value != NaN) {
					return true;
				} else {
					return false;
				}
			}
			
			// Get Data
	function getData() {
		  try{
	var data =[];
			var arrColumns = [];
			
			 arrColumns.push(search.createColumn({name: "internalid",sort: search.Sort.ASC,label: "Internal ID"}));
						  arrColumns.push(search.createColumn({name: "tranid", label: "Document Number"}));
						  arrColumns.push(search.createColumn({name: "trandate", label: "Date"}));
						  arrColumns.push(search.createColumn({name: "entity", label: "Name"}));
						  arrColumns.push(search.createColumn({name: "subsidiarynohierarchy", label: "Subsidiary (no hierarchy)"}));
						  arrColumns.push(search.createColumn({name: "custbody_invoice_delivery_date", label: "Invoice Delivery Date"}));
						  arrColumns.push(search.createColumn({name: "statusref", label: "Status"}));
						  arrColumns.push(search.createColumn({name: "custbody_invoice_delivery_error", label: "Invoice Delivery Error"}));
						  arrColumns.push(search.createColumn({name: "custbody_invoice_delivery_type", label: "Invoice Delivery Type"}));
						  arrColumns.push(search.createColumn({name: "amount", label: "Amount"}));
		
		var objSearch = search.create({	
			            type: "invoice",
					   filters:
					   [
						  ["type","anyof","CustInvc"], 
						  "AND", 
						  ["messages.messagedate","within","6/7/2022 12:00 am","6/8/2022 11:59 pm"], 
						  "AND", 
						  ["messages.isincoming","is","F"], 
						  "AND", 
						  ["messages.subject","contains","Attentive Customer Invoice "], 
						  "AND", 
						  ["mainline","is","T"], 
						  "AND", 
						  ["custbody_invoice_delivery_date","within","6/6/2022 12:00 am","6/7/2022 11:59 pm"]
					   ],
					   columns: arrColumns
					});
			
				var resultSet = objSearch.run();
				// now take the first portion of data.
		var currentRange = resultSet.getRange({
				start : 0,
				end : 1000
		});
		
		var i = 0;  // iterator for all search results
		var j = 0;  // iterator for current result range 0..999

		while ( j < currentRange.length ) {
			// take the result row
			var result = currentRange[j];
			var objLine = {
						internalid:result.getValue('internalid'),
						invDocNumber: result.getValue('tranid'),
						invtranDate: result.getValue('trandate'),
						getCustomer: result.getValue('entity'),
						getSubsidiary: result.getValue('subsidiarynohierarchy'),
						invDeliveryDate: result.getValue('custbody_invoice_delivery_date'),
						invStatus: result.getText('statusref'),
						invDeliveryErr: result.getValue('custbody_invoice_delivery_error'),
						invDeliveryType: result.getText('custbody_invoice_delivery_type'),
						invAmount: result.getValue('amount')
						 };
			   data.push(objLine);
			
			// finally:
			i++; j++;
			if( j==1000 ) {   // check if it reaches 1000
				j=0;          // reset j an reload the next portion
				currentRange = resultSet.getRange({
					start : i,
					end : i+1000
				});
			}
		}
			return data;
	 }
	 catch(e)
		   {
	  log.error({
						title: 'Error',
						details: e
					});
		   }
		}
			
			
	function buildConfigSublist(dataIn) {
	try{
		
		var sblstConfig = dataIn.form.addSublist({id: 'custpage_inv_list',type: serverWidget.SublistType.LIST,label: 'Invoices'});
		
	      sblstConfig.addMarkAllButtons();
			
	 sblstConfig.addField({id : 'custpage_inv_process',type : serverWidget.FieldType.CHECKBOX,label : 'Process'});           
     sblstConfig.addField({id: 'custpage_inv_item',type: serverWidget.FieldType.SELECT,source:'transaction', label: 'Invoice'});
	 	  sblstConfig.getField({id: 'custpage_inv_item'}).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
     sblstConfig.addField({id: 'custpage_inv_tranid',type: serverWidget.FieldType.TEXT,label: 'Invoice #'});
	 sblstConfig.addField({id: 'custpage_inv_date',type: serverWidget.FieldType.DATE,label: 'Transaction Date'});
	 sblstConfig.addField({id: 'custpage_inv_customer',type: serverWidget.FieldType.SELECT,source:'customer',label: 'Customer'});
	      sblstConfig.getField({id: 'custpage_inv_customer'}).updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
     sblstConfig.addField({id: 'custpage_inv_subsidiary',type: serverWidget.FieldType.SELECT,source:'subsidiary',label: 'Subsidiary'});
	 	  sblstConfig.getField({id: 'custpage_inv_subsidiary'}).updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
	 sblstConfig.addField({id: 'custpage_inv_delivery_method',type: serverWidget.FieldType.TEXT,label: 'Delivery Method'});
	 sblstConfig.addField({id: 'custpage_inv_amount',type: serverWidget.FieldType.CURRENCY,label: 'Amount'});
     sblstConfig.addField({id: 'custpage_inv_status',type: serverWidget.FieldType.TEXT,label: 'Status'});
	 sblstConfig.addField({id: 'custpage_inv_delivery_date',type: serverWidget.FieldType.DATETIMETZ,label: 'Date Processed'});
	 sblstConfig.addField({id: 'custpage_inv_error',type: serverWidget.FieldType.TEXT,label: 'Error'});
		
		
		return sblstConfig;
	}
	catch(e)
		   {
	  log.error({
						title: 'Error',
						details: e
					});
		   }
		}
		
			
			return {
				onRequest: onRequest
			};
		});