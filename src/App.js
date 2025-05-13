import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState('');

  useEffect(() => {
    (async function () {
      const response = await fetch('/api/message');
      const result = await response.json();
        setData(result.message);
    })();
  });

  return <div>{data}</div>;
}

export default App;