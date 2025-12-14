import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export const SearchBar = ({ onSearch, loading }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="species-search" className="text-sm font-medium">
          Enter Microbial Species Name
        </Label>
        <div className="flex gap-2">
          <Input
            id="species-search"
            type="text"
            placeholder="e.g., Escherichia coli, Lactobacillus acidophilus"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Search the NCBI Taxonomy database for microbial species. Results include full taxonomic lineage and genome statistics.
      </p>
    </form>
  );
};
