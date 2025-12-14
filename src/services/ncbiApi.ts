import { Species, TaxonomyRank } from '@/types/taxonomy';

const API_BASE = '/ncbi';

export class NCBIService {
  static async lookupSpecies(speciesName: string): Promise<Species | null> {
    try {
      console.log(`Looking up species: ${speciesName}`);

      const taxId = await this.searchTaxId(speciesName);
      if (!taxId) {
        console.warn('Species not found in taxonomy database');
        return null;
      }

      const species = await this.getTaxonomyLineage(taxId);
      if (!species) return null;

      try {
        const genomeStats = await this.getGenomeStats(speciesName);
        if (genomeStats) {
          species.genomeStats = genomeStats;
        }
      } catch (e) {
        console.warn('Failed to fetch genome stats, continuing without them', e);
      }

      return species;
    } catch (error) {
      console.error('Error calling NCBI lookup:', error);
      return null;
    }
  }

  private static async searchTaxId(speciesName: string): Promise<string | null> {
    const response = await fetch(`${API_BASE}/esearch.fcgi?db=taxonomy&term=${encodeURIComponent(speciesName)}&retmode=json`);
    const data = await response.json();
    return data?.esearchresult?.idlist?.[0] || null;
  }

  private static async getTaxonomyLineage(taxId: string): Promise<Species | null> {
    const response = await fetch(`${API_BASE}/efetch.fcgi?db=taxonomy&id=${taxId}&retmode=xml`);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Check for errors in XML
    if (xmlDoc.querySelector("Error")) {
      return null;
    }

    const scientificName = xmlDoc.querySelector("ScientificName")?.textContent || '';
    const commonName = xmlDoc.querySelector("CommonName")?.textContent || '';

    // Lineage Ex
    const lineageEx = xmlDoc.querySelector("LineageEx");
    const taxons: TaxonomyRank[] = [];

    if (lineageEx) {
      const taxonNodes = lineageEx.querySelectorAll("Taxon");
      taxonNodes.forEach(node => {
        const rank = node.querySelector("Rank")?.textContent;
        const name = node.querySelector("ScientificName")?.textContent;
        const tId = node.querySelector("TaxId")?.textContent;
        if (rank && name && tId && rank !== 'no rank') {
          taxons.push({ rank: rank.toLowerCase(), name, taxId: tId });
        }
      });
    }

    // Add species itself
    taxons.push({ rank: 'species', name: scientificName, taxId });

    // Synonyms
    const synonymNodes = xmlDoc.querySelectorAll("Synonym");
    const synonyms = Array.from(synonymNodes).map(n => n.textContent || '').filter(Boolean);

    return {
      id: taxId,
      name: scientificName,
      taxId,
      scientificName,
      commonName: commonName || undefined,
      lineage: taxons,
      synonyms: synonyms.length > 0 ? synonyms : undefined,
    };
  }

  private static async getGenomeStats(speciesName: string) {
    const searchResp = await fetch(`${API_BASE}/esearch.fcgi?db=assembly&term=${encodeURIComponent(speciesName)}&retmode=json`);
    const searchData = await searchResp.json();
    const id = searchData?.esearchresult?.idlist?.[0];
    if (!id) return null;

    const summaryResp = await fetch(`${API_BASE}/esummary.fcgi?db=assembly&id=${id}&retmode=json`);
    const summaryData = await summaryResp.json();
    const data = summaryData?.result?.[id];

    if (!data) return null;

    return {
      size: Number(data.totallength),
      gcContent: data.gc ? parseFloat(data.gc) : undefined,
      assemblyLevel: data.assemblylevel
    };
  }
}
