function beforeLoad(type, form) {
    form.setScript('customscript_invoice_cs');
    form.addButton('custpage_packing_slip', 'Print Invoice', 'onclick_print_invoice()');
    // form.addButton('custpage_send_email', 'Send Email', 'onclick_send_email()');
}