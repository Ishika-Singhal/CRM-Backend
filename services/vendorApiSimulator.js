
const CommunicationLog = require('../models/CommunicationLog'); // To create log entries
const fetch = require('node-fetch'); // For making HTTP requests to our own delivery receipt API

/**
 * Simulates sending personalized messages to a list of customers.
 * It creates CommunicationLog entries and then simulates delivery receipts.
 * @param {string} campaignId - The ID of the campaign.
 * @param {Array<Object>} audience - Array of customer objects ({ customerId, email }).
 * @param {string} messageTemplate - The message content template.
 */
const simulateMessageSending = async (campaignId, audience, messageTemplate) => {
  console.log(`Simulating message sending for Campaign ID: ${campaignId} to ${audience.length} customers.`);

  // Update campaign's pending count immediately
  await CommunicationLog.collection.bulkWrite(
    audience.map(customer => ({
      insertOne: {
        document: {
          campaignId: campaignId,
          customerId: customer.customerId,
          messageContent: messageTemplate.replace('{{customer_email}}', customer.email), // Basic templating
          deliveryStatus: 'pending',
          vendorMessageId: `${campaignId}-${customer.customerId}-${Date.now()}` // Unique ID for this message attempt
        }
      }
    }))
  );

  // Retrieve the created log entries to simulate individual delivery updates
  const pendingLogs = await CommunicationLog.find({ campaignId, deliveryStatus: 'pending' });

  for (const logEntry of pendingLogs) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100)); // 100-600ms delay

    const isSuccess = Math.random() < 0.9; // 90% success, 10% fail
    const status = isSuccess ? 'delivered' : 'failed';
    const failureReason = isSuccess ? null : 'Simulated network error or recipient unavailable.';

    // Simulate the Vendor API calling our Delivery Receipt API
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