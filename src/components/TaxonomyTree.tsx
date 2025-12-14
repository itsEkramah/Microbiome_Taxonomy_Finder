import { useEffect, useRef } from 'react';
import { Species } from '@/types/taxonomy';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaxonomyTreeProps {
  species: Species;
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
  rank?: string;
}

export const TaxonomyTree = ({ species }: TaxonomyTreeProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !species) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Build tree structure from lineage
    const root: TreeNode = {
      name: 'Root',
      children: [],
    };

    let currentLevel = root;
    species.lineage.forEach((rank, index) => {
      const node: TreeNode = {
        name: rank.name,
        rank: rank.rank,
        children: index < species.lineage.length - 1 ? [] : undefined,
      };
      
      if (currentLevel.children) {
        currentLevel.children.push(node);
        currentLevel = node;
      }
    });

    // Set up dimensions
    const width = svgRef.current.clientWidth;
    const height = Math.max(400, species.lineage.length * 60);

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', 'translate(40,20)');

    // Create tree layout
    const treeLayout = d3.tree<TreeNode>()
      .size([height - 40, width - 200]);

    const hierarchyRoot = d3.hierarchy(root);
    const treeData = treeLayout(hierarchyRoot);

    // Draw links
    g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2)
      .attr('d', (d: any) => {
        return `M${d.source.y},${d.source.x}L${d.target.y},${d.target.x}`;
      });

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    nodes.append('circle')
      .attr('r', 6)
      .attr('fill', 'hsl(var(--primary))')
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 2);

    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children ? -10 : 10)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .style('font-size', '12px')
      .style('fill', 'hsl(var(--foreground))')
      .text(d => d.data.name);

    // Add rank labels
    nodes.append('text')
      .attr('dy', '1.5em')
      .attr('x', d => d.children ? -10 : 10)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .style('font-size', '10px')
      .style('fill', 'hsl(var(--muted-foreground))')
      .style('font-style', 'italic')
      .text(d => d.data.rank ? `(${d.data.rank})` : '');

  }, [species]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxonomic Tree Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg ref={svgRef} className="w-full min-h-[400px]" />
        </div>
      </CardContent>
    </Card>
  );
};
