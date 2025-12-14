import { Species } from '@/types/taxonomy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PhylogeneticTree } from './PhylogeneticTree';

interface ComparisonViewProps {
  species: Species[];
}

export const ComparisonView = ({ species }: ComparisonViewProps) => {
  const allRanks = new Set<string>();
  species.forEach(s => s.lineage.forEach(l => allRanks.add(l.rank)));
  const sortedRanks = Array.from(allRanks).sort();

  const formatNumber = (num?: number) => {
    if (!num) return '-';
    return num.toLocaleString();
  };

  const formatGC = (gc?: number) => {
    if (!gc) return '-';
    return `${gc.toFixed(2)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Species Comparison ({species.length} species)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Taxonomic Comparison */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Taxonomic Lineage Comparison</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Rank</TableHead>
                  {species.map(s => (
                    <TableHead key={s.id} className="min-w-[200px]">
                      {s.scientificName || s.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRanks.map(rank => (
                  <TableRow key={rank}>
                    <TableCell className="font-medium capitalize">{rank}</TableCell>
                    {species.map(s => {
                      const lineageItem = s.lineage.find(l => l.rank === rank);
                      return (
                        <TableCell key={s.id} className="italic">
                          {lineageItem?.name || '-'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Genome Statistics Comparison */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Genome Statistics Comparison</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Species</TableHead>
                  <TableHead>TaxID</TableHead>
                  <TableHead>Genome Size (bp)</TableHead>
                  <TableHead>GC Content</TableHead>
                  <TableHead>Assembly Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {species.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium italic">{s.scientificName || s.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.taxId}</Badge>
                    </TableCell>
                    <TableCell>{formatNumber(s.genomeStats?.size)}</TableCell>
                    <TableCell>{formatGC(s.genomeStats?.gcContent)}</TableCell>
                    <TableCell className="capitalize">{s.genomeStats?.assemblyLevel || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Phylogenetic Tree */}
        <PhylogeneticTree species={species} />
      </CardContent>
    </Card>
  );
};
