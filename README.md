# Microbiome Taxonomy Finder

A professional bioinformatics tool for automated retrieval, visualization, and comparison of microbial taxonomic lineages using NCBI databases.

## 🚀 Features

- **Taxonomic Search**: Instantly look up microbial species by name using real-time NCBI database integration.
- **Detailed Lineage**: View complete taxonomic hierarchies from kingdom to strain.
- **Interactive Visualizations**:
  - **Taxonomy Trees**: Explore lineage relationships visually.
  - **Data Tables**: comprehensive views of genome statistics and metadata.
- **Comparison View**: Compare multiple species side-by-side to analyze differences in lineage and characteristics.
- **Export Capabilities**: Download taxonomic data and visualizations for research and presentations.
- **Responsive Design**: Modern, clean interface optimized for both desktop and tablet use.

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: TanStack Query
- **Charts & Visualization**: Recharts, D3
- **Icons**: Lucide React
- **API**: NCBI Taxonomy and Genome Databases

## 📦 Installation

Prerequisites: Node.js (v18 or higher recommended) and npm (or bun/yarn).

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd microbe-navigator
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

## 🏃‍♂️ Usage

### Development Server
Start the local development server with hot-reload:
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser (port may vary if 8080 is taken, check terminal output).

### Production Build
Create an optimized production build:
```bash
npm run build
```
The output will be in the `dist/` directory.

### Preview Production Build
Locally preview the production build:
```bash
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
