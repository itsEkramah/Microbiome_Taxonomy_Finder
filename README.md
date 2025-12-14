Microbiome Taxonomy Finder

A cutting-edge bioinformatics tool designed for the automated retrieval, visualization, and comparison of microbial taxonomic lineages using NCBI databases.

🚀 Features

Taxonomic Search: Effortlessly search for microbial species by name, with real-time integration from NCBI’s vast database.

Complete Lineage Information: Access full taxonomic hierarchies, from the kingdom level down to the specific strain.

Interactive Visualizations:

Taxonomy Trees: Visually explore relationships between different microbial species.

Data Tables: Detailed tables of genome statistics and associated metadata for in-depth analysis.

Comparison Tool: Compare multiple species side-by-side to identify differences in taxonomic lineage and characteristics.

Export Functionality: Download taxonomic data and visualizations for further analysis, research, or presentation.

Responsive UI: A sleek, modern interface optimized for both desktop and tablet devices.

🛠️ Tech Stack

Frontend Framework: React 18 with TypeScript

Build Tool: Vite

Styling: Tailwind CSS, Shadcn UI

State Management: TanStack Query

Charts & Visualizations: Recharts, D3.js

Icons: Lucide React

API: NCBI Taxonomy and Genome Databases for retrieving and processing microbial data

📦 Installation
Prerequisites

Ensure that you have Node.js (v18 or higher) and npm (or bun/yarn) installed on your machine.

Clone the repository:

git clone <repository-url>
cd microbiome-taxonomy-finder


Install dependencies:

npm install

🏃‍♂️ Usage
Development Server

To start the local development server with hot-reloading enabled, run:

npm run dev


Navigate to http://localhost:8080
 in your browser (port may vary, check terminal output for details).

Production Build

To create a production-ready optimized build:

npm run build


The build files will be placed in the dist/ directory.

Preview Production Build

To locally preview the production build before deployment:

npm run preview

🤝 Contributing

We welcome contributions from the community! If you'd like to contribute, please follow these steps:

Fork the repository.

Create a new feature branch (git checkout -b feature/YourFeature).

Make your changes and commit them (git commit -m 'Add some feature').

Push to your branch (git push origin feature/YourFeature).

Open a Pull Request.

📄 License

This project is open-source and available under the MIT License
.