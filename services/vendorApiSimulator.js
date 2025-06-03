
const CommunicationLog = require('../models/CommunicationLog'); 
const fetch = require('node-fetch'); 
const simulateMessageSending = async (campaignId, audience, messageTemplate) => {
  console.log(`Simulating message sending for Campaign ID: ${campaignId} to ${audience.length} customers.`);

  await CommunicationLog.collection.bulkWrite(
    audience.map(customer => ({
      insertOne: {
        document: {
          campaignId: campaignId,
          customerId: customer.customerId,
          messageContent: messageTemplate.replace('{{customer_email}}', customer.email), 
          deliveryStatus: 'pending',
          vendorMessageId: `${campaignId}-${customer.customerId}-${Date.now()}` 
        }
      }
    }))
  );

  const pendingLogs = await CommunicationLog.find({ campaignId, deliveryStatus: 'pending' });

  for (const logEntry of pendingLogs) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100)); 

    const isSuccess = Math.random() < 0.9;
    const status = isSuccess ? 'delivered' : 'failed';
    const failureReason = isSuccess ? null : 'Simulated network error or recipient unavailable.';

    try {
      const response = await fetch(`${process.env.FRONTEND_URL}/api/communication-logs/delivery-receipt`, { // Use backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendorMessageId: logEntry.vendorMessageId,
          status: status,
          failureReason: failureReason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to send delivery receipt for ${logEntry.vendorMessageId}:`, errorData.message);
      } else {
        console.log(`Delivery receipt sent for ${logEntry.vendorMessageId} with status: ${status}`);
      }
    } catch (error) {
      console.error(`Error simulating delivery receipt call for ${logEntry.vendorMessageId}:`, error.message);
    }
  }
  console.log(`Finished simulating message sending for Campaign ID: ${campaignId}.`);
};

module.exports = {
  simulateMessageSending
};