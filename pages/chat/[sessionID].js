import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import valhallah from '../../components/valhallah'; // Import your Valhallah component

const ChatPage = () => {
    const router = useRouter();
    const { sessionID } = router.query; // Access the sessionID from the URL
    const [aiListingUrl, setAiListingUrl] = useState(null);

    useEffect(() => {
        if (sessionID) {
            // Fetch the mylistingurl using the sessionID
            const fetchListingUrl = async () => {
                try {
                    const response = await axios.get(`/api/dbGetVisitor`, {
                        params: { sessionID }
                    });
                    if (response.status === 200 && response.data.data) {
                        setAiListingUrl(response.data.data.mylistingurl);
                    } else {
                        console.error('No data found for this sessionID');
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

            fetchListingUrl();
        }
    }, [sessionID]);

    if (!aiListingUrl) {
        return <div>Loading...</div>; // Show a loading state until the URL is fetched
    }

    return (
        <div>
            <valhallah aiListingUrl={aiListingUrl} />
        </div>
    );
};

export default ChatPage;
