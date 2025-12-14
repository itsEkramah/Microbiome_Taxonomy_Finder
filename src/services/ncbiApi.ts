import { Species } from '@/types/taxonomy';
import { supabase } from '@/integrations/supabase/client';

export class NCBIService {
  // Complete species lookup using edge function
  static async lookupSpecies(speciesName: string): Promise<Species | null> {
    try {
      console.log(`Looking up species: ${speciesName}`);
      
      const { data, error } = await supabase.functions.invoke('ncbi-lookup', {
        body: { speciesName }
      });

      if (error) {
        console.error('Edge function error:', error);
        return null;
      }

      if (data?.error) {
        console.error('NCBI lookup error:', data.error);
        return null;
      }

      console.log('Species data received:', data);
      return data as Species;
    } catch (error) {
      console.error('Error calling NCBI lookup:', error);
      return null;
    }
  }
}
