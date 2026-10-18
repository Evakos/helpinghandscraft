import https from 'https';

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const consumerKey = process.env.VITE_WC_CONSUMER_KEY;
  const consumerSecret = process.env.VITE_WC_CONSUMER_SECRET;
  const wpHost = 'woocommerce-636274-2070583.cloudwaysapps.com';

  if (!consumerKey || !consumerSecret) {
    return res.status(500).json({ message: 'Server configuration error: WooCommerce API keys not set' });
  }

  try {
    // Fetch all completed orders (paginated)
    let allOrders = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const path = `/wp-json/wc/v3/orders?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}&status=completed&per_page=100&page=${page}`;
      const orders = await httpsGet(wpHost, path);
      
      if (orders.length === 0) {
        hasMore = false;
      } else {
        allOrders = allOrders.concat(orders);
        page++;
      }
    }

    // Deduplicate customers by email and build CSV data
    const customerMap = new Map();

    for (const order of allOrders) {
      const billing = order.billing || {};
      const email = billing.email || '';
      if (!email) continue;

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          first_name: billing.first_name || '',
          last_name: billing.last_name || '',
          phone: billing.phone || '',
          address_1: billing.address_1 || '',
          address_2: billing.address_2 || '',
          city: billing.city || '',
          state: billing.state || '',
          postcode: billing.postcode || '',
          country: billing.country || '',
          total_spent: parseFloat(order.total || 0),
          order_count: 1,
          last_order_date: order.date_created || '',
          last_order_id: order.id || '',
        });
      } else {
        const existing = customerMap.get(email);
        existing.total_spent += parseFloat(order.total || 0);
        existing.order_count += 1;
      }
    }

    const customers = Array.from(customerMap.values());

    // Build CSV
    const headers = [
      'Email',
      'First Name',
      'Last Name',
      'Phone',
      'Address Line 1',
      'Address Line 2',
      'City',
      'State',
      'Postcode',
      'Country',
      'Total Spent (£)',
      'Order Count',
      'Last Order Date',
      'Last Order ID',
    ];

    const csvRows = [headers.join(',')];

    for (const customer of customers) {
      const row = [
        escapeCsv(customer.email),
        escapeCsv(customer.first_name),
        escapeCsv(customer.last_name),
        escapeCsv(customer.phone),
        escapeCsv(customer.address_1),
        escapeCsv(customer.address_2),
        escapeCsv(customer.city),
        escapeCsv(customer.state),
        escapeCsv(customer.postcode),
        escapeCsv(customer.country),
        customer.total_spent.toFixed(2),
        customer.order_count,
        customer.last_order_date,
        customer.last_order_id,
      ];
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="helping-hands-craft-customers-${new Date().toISOString().split('T')[0]}.csv"`);

    return res.status(200).send(csv);
  } catch (error) {
    console.error('Customer export error:', error);
    return res.status(500).json({ message: error.message || 'Something went wrong. Please try again.' });
  }
}

function httpsGet(host, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: 443,
      path: path,
      method: 'GET',
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Helping-Hands-Craft/1.0',
      },
    };

    const req = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`WooCommerce API error: ${response.statusCode} ${response.statusMessage}`));
            return;
          }
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse WooCommerce response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`WooCommerce API request failed: ${e.message}`));
    });

    req.end();
  });
}

function escapeCsv(value) {
  if (!value) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
