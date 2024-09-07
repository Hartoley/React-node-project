const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000; // You can change this port

app.use(cors());

flutterwave = (req, res)=>{
    app.get('/api/flutterwave/:endpoint', (req, res) => {
        const url = `https://api.flutterwave.com/v3/payments/${req.params.endpoint}`;
        const options = {
          headers: {
            'Content-Type': 'application/json',
            // Add any other required headers here
          }
        };
      
        // Make the request to Flutterwave API
        fetch(url, options)
          .then(response => response.json())
          .then(data => {
            res.json(data);
          })
          .catch(error => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Failed to fetch data' });
          });
      });
      
      app.listen(port, () => {
        console.log(`Proxy server listening on port ${port}`);
      });
    }

      module.exports= {flutterwave}