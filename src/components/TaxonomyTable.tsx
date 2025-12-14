import { Species } from '@/types/taxonomy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TaxonomyTableProps {
  species: Species;
}

export const TaxonomyTable = ({ species }: TaxonomyTableProps) => {
  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  const formatGC = (gc?: number) => {
    if (!gc) return 'N/A';
    return `${gc.toFixed(2)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{species.scientificName || species.name}</span>
          <Badge variant="secondary">TaxID: {species.taxId}</Badge>
        </CardTitle>
        <CardDescription>
          {species.commonName && <span className="font-medium">Common Name: {species.commonName}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Taxonomic Lineage */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Taxonomic Lineage</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {species.lineage.map((rank, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium capitalize">{rank.rank}</TableCell>
                  <TableCell className="italic">{rank.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Genome Statistics */}
        {species.genomeStats && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Genome Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Genome Size</p>
                <p className="text-lg font-semibold">{formatNumber(species.genomeStats.size)} bp</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">GC Content</p>
                <p className="text-lg font-semibold">{formatGC(species.genomeStats.gcContent)}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Assembly Level</p>
                <p className="text-lg font-semibold capitalize">{species.genomeStats.assemblyLevel || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Synonyms */}
        {species.synonyms && species.synonyms.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Alternative Names & Synonyms</h3>
            <div className="flex flex-wrap gap-2">
              {species.synonyms.map((synonym, index) => (
                <Badge key={index} variant="outline">
                  {synonym}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
