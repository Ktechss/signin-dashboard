const fs = require('fs');
const path = require('path');

// Generate PDF thumbnail from first page
async function generatePdfThumbnail(pdfPath) {
  // Dynamic import for ES module - it exports a named 'pdf' function
  const { pdf } = await import('pdf-to-img');

  // Convert PDF to images (we only need the first page)
  const document = await pdf(pdfPath, { scale: 2 });

  // Get the first page
  for await (const page of document) {
    // Convert the buffer to base64
    const base64 = page.toString('base64');
    return `data:image/png;base64,${base64}`;
  }
}

// Main async function to generate blueprints
async function generateBlueprints() {
  // Read the sample documents
  const pdfPath = path.join(__dirname, 'public/sample-documents/Lorem_ipsum.pdf');
  const jpegPath = path.join(__dirname, 'public/sample-documents/Tenancy Contract.jpeg');

  const pdfBuffer = fs.readFileSync(pdfPath);
  const jpegBuffer = fs.readFileSync(jpegPath);

  // Convert to base64 with proper data URI prefix
  const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
  const jpegBase64 = `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;

  // Generate actual PDF thumbnail from first page
  console.log('Generating PDF thumbnail from first page...');
  const pdfThumbnail = await generatePdfThumbnail(pdfPath);

  const sampleBlueprints = [
  {
    id: 1733500000001,
    name: "Sales Agreement",
    description: "Standard sales agreement template for commercial transactions",
    category: "commercial",
    tags: ["sales", "contract"],
    status: "active",
    version: "1.0",
    fileName: "Tenancy Contract.jpeg",
    documentData: {
      data: jpegBase64,
      thumbnail: jpegBase64,
      type: "image/jpeg"
    },
    filePreview: jpegBase64,
    preview: jpegBase64,
    lastModified: "2 days ago",
    createdAt: "2025-12-06T10:30:00.000Z",
    usageCount: 0,
    fields: [
      {
        id: 1733500001,
        type: "signature",
        x: 67.859375,
        y: 527.5,
        width: 180,
        height: 60,
        role: "1",
        required: true
      },
      {
        id: 1733500002,
        type: "signature",
        x: 323.859375,
        y: 528.5,
        width: 180,
        height: 60,
        role: "2",
        required: true
      }
    ],
    parties: [
      {
        id: 1,
        name: "Signer 1",
        required: true,
        minCount: 1,
        maxCount: 1,
        order: 1
      },
      {
        id: 2,
        name: "Signer 2",
        required: true,
        minCount: 1,
        maxCount: 1,
        order: 2
      }
    ]
  },
  {
    id: 1733500000002,
    name: "Non-Disclosure Agreement",
    description: "Confidentiality agreement for protecting sensitive information",
    category: "legal",
    tags: ["nda", "confidentiality"],
    status: "active",
    version: "1.2",
    fileName: "Lorem_ipsum.pdf",
    documentData: {
      data: pdfBase64,
      thumbnail: pdfThumbnail,
      type: "application/pdf"
    },
    filePreview: pdfThumbnail,
    preview: pdfThumbnail,
    lastModified: "1 week ago",
    createdAt: "2025-11-28T14:20:00.000Z",
    usageCount: 0,
    fields: [
      {
        id: 1733500005,
        type: "signature",
        x: 67.859375,
        y: 577.5,
        width: 180,
        height: 60,
        role: "1",
        required: true
      },
      {
        id: 1733500006,
        type: "signature",
        x: 323.859375,
        y: 578.5,
        width: 180,
        height: 60,
        role: "2",
        required: true
      }
    ],
    parties: [
      {
        id: 1,
        name: "Disclosing Party",
        required: true,
        minCount: 1,
        maxCount: 1,
        order: 1
      },
      {
        id: 2,
        name: "Receiving Party",
        required: true,
        minCount: 1,
        maxCount: 1,
        order: 2
      }
    ]
  },
  {
    id: 1733500000003,
    name: "Employment Contract",
    description: "Standard employment agreement template",
    category: "hr",
    tags: ["employment", "hr"],
    status: "active",
    version: "2.0",
    fileName: "Tenancy Contract.jpeg",
    documentData: {
      data: jpegBase64,
      thumbnail: jpegBase64,
      type: "image/jpeg"
    },
    filePreview: jpegBase64,
    preview: jpegBase64,
    lastModified: "3 days ago",
    createdAt: "2025-12-05T09:15:00.000Z",
    usageCount: 0,
    fields: [
      {
        id: 1733500010,
        type: "signature",
        x: 67.859375,
        y: 527.5,
        width: 180,
        height: 60,
        role: "1",
        required: true
      },
      {
        id: 1733500011,
        type: "signature",
        x: 323.859375,
        y: 528.5,
        width: 180,
        height: 60,
        role: "2",
        required: true
      }
    ],
    parties: [
      {
        id: 1,
        name: "Employee",
        required: true,
        minCount: 1,
        maxCount: 1,
        order: 1
      },
      {
        id: 2,
        name: "Employer",
        required: true,
        minCount: 1,
        maxCount: 1,
        order: 2
      }
    ]
  },
  {
    id: 1733500000004,
    name: "Service Agreement",
    description: "Professional services agreement template",
    category: "commercial",
    tags: ["services", "contract"],
    status: "draft",
    version: "0.9",
    fileName: "Lorem_ipsum.pdf",
    documentData: {
      data: pdfBase64,
      thumbnail: pdfThumbnail,
      type: "application/pdf"
    },
    filePreview: pdfThumbnail,
    preview: pdfThumbnail,
    lastModified: "1 month ago",
    createdAt: "2025-11-08T16:45:00.000Z",
    usageCount: 0,
    fields: [
      {
        id: 1733500014,
        type: "signature",
        x: 67.859375,
        y: 547.5,
        width: 180,
        height: 60,
        role: "1",
        required: true
      },
      {
        id: 1733500015,
        type: "signature",
        x: 323.859375,
        y: 548.5,
        width: 180,
        height: 60,
        role: "2",
        required: true
      }
    ],
    parties: [
      {
        id: 1,
        name: "Service Provider",
        required: true,
        minCount: 1,
        maxCount: 1,
        order: 1
      },
      {
        id: 2,
        name: "Client",
        required: true,
        minCount: 1,
        maxCount: 1,
        order: 2
      }
    ]
  },
  {
    id: 1733500000005,
    name: "Lease Agreement",
    description: "Property lease agreement for rental properties",
    category: "legal",
    tags: ["lease", "property", "rental"],
    status: "active",
    version: "1.5",
    fileName: "Tenancy Contract.jpeg",
    documentData: {
      data: jpegBase64,
      thumbnail: jpegBase64,
      type: "image/jpeg"
    },
    filePreview: jpegBase64,
    preview: jpegBase64,
    lastModified: "5 days ago",
    createdAt: "2025-12-03T11:30:00.000Z",
    usageCount: 0,
    fields: [
      {
        id: 1733500023,
        type: "signature",
        x: 67.859375,
        y: 527.5,
        width: 180,
        height: 60,
        role: "1",
        required: true
      },
      {
        id: 1733500024,
        type: "signature",
        x: 323.859375,
        y: 528.5,
        width: 180,
        height: 60,
        role: "2",
        required: true
      }
    ],
    parties: [
      {
        id: 1,
        name: "Landlord",
        required: true,
        minCount: 1,
        maxCount: 1,
        order: 1
      },
      {
        id: 2,
        name: "Tenant",
        required: true,
        minCount: 1,
        maxCount: 1,
        order: 2
      }
    ]
  }
  ];

  // Write to file
  fs.writeFileSync(
    path.join(__dirname, 'public/sample-blueprints.json'),
    JSON.stringify(sampleBlueprints, null, 2)
  );

  console.log('✅ Sample blueprints generated successfully!');
  console.log(`📄 Generated ${sampleBlueprints.length} sample blueprints`);
  console.log(`📦 File size: ${(fs.statSync(path.join(__dirname, 'public/sample-blueprints.json')).size / 1024).toFixed(2)} KB`);
}

// Run the script
generateBlueprints().catch((error) => {
  console.error('Error generating blueprints:', error);
  process.exit(1);
});
