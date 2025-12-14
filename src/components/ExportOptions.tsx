import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Species } from '@/types/taxonomy';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportOptionsProps {
  species: Species[];
}

export const ExportOptions = ({ species }: ExportOptionsProps) => {
  const exportToCSV = () => {
    const csvRows = [];
    
    // Headers
    csvRows.push(['Species', 'TaxID', 'Rank', 'Taxonomic Name', 'Genome Size', 'GC Content', 'Assembly Level'].join(','));
    
    // Data rows
    species.forEach(s => {
      s.lineage.forEach(rank => {
        csvRows.push([
          s.scientificName || s.name,
          s.taxId,
          rank.rank,
          rank.name,
          s.genomeStats?.size || '',
          s.genomeStats?.gcContent || '',
          s.genomeStats?.assemblyLevel || ''
        ].map(field => `"${field}"`).join(','));
      });
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxonomy_export_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(species, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxonomy_export_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (species.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToCSV}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
