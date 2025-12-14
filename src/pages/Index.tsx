import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { TaxonomyTable } from '@/components/TaxonomyTable';
import { TaxonomyTree } from '@/components/TaxonomyTree';
import { ComparisonView } from '@/components/ComparisonView';
import { ExportOptions } from '@/components/ExportOptions';
import { NCBIService } from '@/services/ncbiApi';
import { Species } from '@/types/taxonomy';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Microscope, Database, GitCompare, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [species, setSpecies] = useState<Species[]>([]);
  const [activeView, setActiveView] = useState<'single' | 'comparison'>('single');
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const result = await NCBIService.lookupSpecies(query);
      
      if (result) {
        setSpecies(prev => {
          // Avoid duplicates
          const exists = prev.find(s => s.taxId === result.taxId);
          if (exists) {
            toast({
              title: 'Species already added',
              description: `${result.scientificName} is already in your results.`,
              variant: 'default',
            });
            return prev;
          }
          return [...prev, result];
        });
        
        toast({
          title: 'Species found!',
          description: `Successfully retrieved data for ${result.scientificName || result.name}`,
        });

        if (species.length > 0) {
          setActiveView('comparison');
        }
      } else {
        toast({
          title: 'Species not found',
          description: `No taxonomic data found for "${query}". Please check the spelling or try a different name.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch species data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeSpecies = (taxId: string) => {
    setSpecies(prev => prev.filter(s => s.taxId !== taxId));
  };

  const clearAll = () => {
    setSpecies([]);
    setActiveView('single');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Microscope className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Microbiome Taxonomy Finder</h1>
          </div>
          <p className="text-muted-foreground">
            Automated retrieval and visualization of microbial taxonomic lineages from NCBI databases
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Search Section */}
        <section className="flex flex-col items-center space-y-4">
          <SearchBar onSearch={handleSearch} loading={loading} />
          
          {species.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Active species:</span>
              {species.map(s => (
                <Badge key={s.taxId} variant="secondary" className="gap-2">
                  {s.scientificName || s.name}
                  <button
                    onClick={() => removeSpecies(s.taxId)}
                    className="hover:text-destructive"
                    aria-label={`Remove ${s.scientificName}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
              <ExportOptions species={species} />
            </div>
          )}
        </section>

        {/* Results Section */}
        {species.length > 0 && (
          <section>
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="single" className="gap-2">
                  <Database className="h-4 w-4" />
                  Individual View
                </TabsTrigger>
                <TabsTrigger value="comparison" className="gap-2" disabled={species.length < 2}>
                  <GitCompare className="h-4 w-4" />
                  Comparison View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-6 mt-6">
                {species.map(s => (
                  <div key={s.taxId} className="space-y-4">
                    <TaxonomyTable species={s} />
                    <TaxonomyTree species={s} />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="comparison" className="mt-6">
                {species.length >= 2 ? (
                  <ComparisonView species={species} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add at least 2 species to enable comparison view</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>
        )}

        {/* Empty State */}
        {species.length === 0 && !loading && (
          <section className="text-center py-16 space-y-4">
            <div className="flex justify-center gap-4 mb-6">
              <Microscope className="h-16 w-16 text-muted-foreground opacity-50" />
              <Database className="h-16 w-16 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Welcome to Microbiome Taxonomy Finder</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Search for microbial species to view their complete taxonomic lineage, genome statistics, 
              and visualizations. Add multiple species to enable side-by-side comparison.
            </p>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSearch('Escherichia coli')}>
                  Escherichia coli
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSearch('Lactobacillus acidophilus')}>
                  Lactobacillus acidophilus
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSearch('Staphylococcus aureus')}>
                  Staphylococcus aureus
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Data sourced from NCBI Taxonomy and Genome databases</p>
          <p className="mt-1">Built for bioinformatics research and education</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
