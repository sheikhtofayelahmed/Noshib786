// pages/api/win.js

export default function handler(req, res) {
    if (req.method === 'GET') {
      return res.status(200).json({
        straightWin: '415',
        singleWin: '5',
        gameNumber: '12',
        date: '2025-05-07',
        day: 'Wednesday',
      });
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  