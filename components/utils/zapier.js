// components/utils/zapier.js
export const callZapierWebhook = async (email, website) => {
  const webhookUrl = 'https://hooks.zapier.com/hooks/catch/15076287/3vv4bs9/'; // Replace with your Zapier webhook URL

  const payload = {
      email: email,
      website: website
  };

  try {
      const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error calling Zapier webhook:', error);
      throw error;
  }
};
