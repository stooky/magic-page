// utils/zapier.js
import axios from 'axios';

export const callZapierWebhook = async (websiteUrl) => {
  const webhookUrl = 'https://hooks.zapier.com/hooks/catch/15076287/3vv4bs9/'; // Replace with your Zapier webhook URL

  try {
    const response = await axios.post(webhookUrl, { website: websiteUrl });
    return response.data; // This should now include the response text from the Zap
  } catch (error) {
    console.error('Error calling Zapier webhook:', error);
    throw error;
  }
};
