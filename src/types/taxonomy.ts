export interface TaxonomyRank {
  rank: string;
  name: string;
  taxId: string;
}

export interface GenomeStats {
  size?: number;
  gcContent?: number;
  assemblyLevel?: string;
}

export interface Species {
  id: string;
  name: string;
  taxId: string;
  lineage: TaxonomyRank[];
  synonyms?: string[];
  genomeStats?: GenomeStats;
  scientificName?: string;
  commonName?: string;
}

export interface ComparisonData {
  species: Species[];
  selectedIds: string[];
}
