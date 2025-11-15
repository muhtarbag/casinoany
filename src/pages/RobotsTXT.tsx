import { useEffect, useState } from 'react';

export default function RobotsTXT() {
  const [txtContent, setTxtContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRobots = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/robots`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
          }
        );
        
        if (response.ok) {
          const txt = await response.text();
          setTxtContent(txt);
        }
      } catch (error) {
        console.error('Error fetching robots.txt:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRobots();
  }, []);

  if (loading) {
    return <div>Loading robots.txt...</div>;
  }

  return (
    <pre style={{ 
      fontFamily: 'monospace', 
      whiteSpace: 'pre-wrap',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      {txtContent}
    </pre>
  );
}
