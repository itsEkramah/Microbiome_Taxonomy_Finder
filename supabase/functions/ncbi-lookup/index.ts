import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// Helper function to extract XML tag content
function extractXMLTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

// Helper function to extract all occurrences of a tag
function extractAllXMLTags(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'gi');
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

async function searchTaxId(speciesName: string): Promise<string | null> {
  console.log(`Searching TaxID for: ${speciesName}`);
  try {
    const response = await fetch(
      `${NCBI_BASE_URL}/esearch.fcgi?db=taxonomy&term=${encodeURIComponent(speciesName)}&retmode=json`
    );
    const data = await response.json();
    console.log('Search response:', JSON.stringify(data));
    
    const idList = data?.esearchresult?.idlist;
    return idList && idList.length > 0 ? idList[0] : null;
  } catch (error) {
    console.error('Error searching TaxID:', error);
    return null;
  }
}

async function getTaxonomyLineage(taxId: string): Promise<any | null> {
  console.log(`Fetching taxonomy for TaxID: ${taxId}`);
  try {
    const response = await fetch(
      `${NCBI_BASE_URL}/efetch.fcgi?db=taxonomy&id=${taxId}&retmode=xml`
    );
    const xmlText = await response.text();
    console.log('Taxonomy XML received, length:', xmlText.length);

    // Parse XML manually using regex
    const scientificName = extractXMLTag(xmlText, 'ScientificName') || '';
    const commonName = extractXMLTag(xmlText, 'CommonName') || '';
    
    // Extract lineage text
    const lineageMatch = xmlText.match(/<Lineage>([^<]*)<\/Lineage>/i);
    const lineageText = lineageMatch ? lineageMatch[1] : '';
    
    // Extract LineageEx for detailed rank info
    const lineageExMatch = xmlText.match(/<LineageEx>([\s\S]*?)<\/LineageEx>/i);
    const lineageEx = lineageExMatch ? lineageExMatch[1] : '';
    
    // Parse LineageEx taxons
    const taxons: Array<{rank: string, name: string, taxId: string}> = [];
    const taxonRegex = /<Taxon>([\s\S]*?)<\/Taxon>/gi;
    let taxonMatch;
    
    while ((taxonMatch = taxonRegex.exec(lineageEx)) !== null) {
      const taxonXml = taxonMatch[1];
      const taxonId = extractXMLTag(taxonXml, 'TaxId') || '';
      const taxonName = extractXMLTag(taxonXml, 'ScientificName') || '';
      const rank = extractXMLTag(taxonXml, 'Rank') || '';
      
      if (taxonName && rank && rank !== 'no rank') {
        taxons.push({
          rank: rank.toLowerCase(),
          name: taxonName,
          taxId: taxonId
        });
      }
    }
    
    // Add the species itself
    taxons.push({
      rank: 'species',
      name: scientificName,
      taxId: taxId
    });

    // Extract synonyms
    const synonyms = extractAllXMLTags(xmlText, 'Synonym');

    console.log(`Found ${taxons.length} lineage ranks for ${scientificName}`);

    return {
      id: taxId,
      name: scientificName,
      taxId,
      scientificName,
      commonName: commonName || undefined,
      lineage: taxons,
      synonyms: synonyms.length > 0 ? synonyms : undefined,
    };
  } catch (error) {
    console.error('Error fetching taxonomy:', error);
    return null;
  }
}

async function getGenomeStats(speciesName: string): Promise<any | null> {
  console.log(`Fetching genome stats for: ${speciesName}`);
  try {
    // Search for genome assembly
    const searchResponse = await fetch(
      `${NCBI_BASE_URL}/esearch.fcgi?db=assembly&term=${encodeURIComponent(speciesName)}&retmode=json`
    );
    const searchData = await searchResponse.json();
    
    const assemblyIds = searchData?.esearchresult?.idlist;
    if (!assemblyIds || assemblyIds.length === 0) {
      console.log('No assembly found');
      return null;
    }

    console.log(`Found assembly ID: ${assemblyIds[0]}`);

    // Get assembly details
    const summaryResponse = await fetch(
      `${NCBI_BASE_URL}/esummary.fcgi?db=assembly&id=${assemblyIds[0]}&retmode=json`
    );
    const summaryData = await summaryResponse.json();

    const assemblyData = summaryData?.result?.[assemblyIds[0]];
    if (!assemblyData) {
      console.log('No assembly data in response');
      return null;
    }

    console.log('Genome stats:', {
      size: assemblyData.totallength,
      gc: assemblyData.gc,
      level: assemblyData.assemblylevel
    });

    return {
      size: assemblyData.totallength,
      gcContent: assemblyData.gc ? parseFloat(assemblyData.gc) : undefined,
      assemblyLevel: assemblyData.assemblylevel,
    };
  } catch (error) {
    console.error('Error fetching genome stats:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { speciesName } = await req.json();
    console.log(`\n=== NCBI Lookup for: ${speciesName} ===`);

    if (!speciesName) {
      return new Response(
        JSON.stringify({ error: 'Species name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get TaxID
    const taxId = await searchTaxId(speciesName);
    if (!taxId) {
      return new Response(
        JSON.stringify({ error: 'Species not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get taxonomy data
    const species = await getTaxonomyLineage(taxId);
    if (!species) {
      return new Response(
        JSON.stringify({ error: 'Could not retrieve taxonomy data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get genome stats
    const genomeStats = await getGenomeStats(speciesName);
    if (genomeStats) {
      species.genomeStats = genomeStats;
    }

    console.log(`=== Completed lookup for ${species.scientificName} ===\n`);

    return new Response(
      JSON.stringify(species),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
