import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gunakan /tmp untuk Vercel
const filePath = path.join('/tmp', 'data.json');

// Fungsi untuk membaca data dari file JSON
function readData() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
            console.log('Created new data.json file');
        }
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return [];
    }
}

// Fungsi untuk menulis data ke file JSON
function writeData(data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log('Data written successfully');
    } catch (error) {
        console.error('Error writing data:', error);
    }
}

// Export handler function untuk Vercel
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const data = readData();
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const { text, pesan } = req.body;
            if (!text || !pesan) {
                return res.status(400).json({ message: 'Text and Pesan are required' });
            }

            const data = readData();
            const newText = {
                id: Date.now(),
                text,
                pesan,
                createdAt: new Date().toISOString()
            };
            data.push(newText);
            writeData(data);

            return res.status(201).json(newText);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            const data = readData();
            const filteredData = data.filter(item => item.id !== parseInt(id, 10));

            if (data.length === filteredData.length) {
                return res.status(404).json({ message: 'Text not found' });
            }

            writeData(filteredData);
            return res.status(200).json({ message: 'Text deleted successfully' });
        }

        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
